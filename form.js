/**
 * Generic Form Handling through Element Attributes
 */

$(function () {

  $(document).on('click', '[data-form-click-submit]', function (e) {
    e.preventDefault();
    handleFormSubmit($(this));
  });

  $(document).on('change', '[data-form-change-submit]', function (e) {
    e.preventDefault();
    handleFormSubmit($(this));
  });

  $(document).on('keydown', '[data-form-enter-submit]', function (e) {
    var code = e.keyCode || e.which;
    if( code == 13 ) {
      handleFormSubmit($(this));
      return false;
    }
  });

  setInterval(function () {
    setupFormTimeouts();
  }, 5000);

  $('[data-form-onload-submit]').each(function () {
    var $form = $(this);
    
    $loadingTarget = false;
    if( $form.attr('data-form-loading-target') ) {
      $loadingTarget = $($form.attr('data-form-result-target'));
    } else {
      $loadingTarget = $form.parent();
    }

    $loadingTarget.addClass('loading');
    
    if( $form.is('[data-form-ajax]') ) {
      submitFormAjax($form);
    } else {
      $form.submit();
    }
  });

  function setupFormTimeouts() {
    $('[data-form-timeout-submit]').each(function () {
      var $form = $(this);

      if( $form.attr('[data-form-onload-submit]') &&
          $form.attr('[data-form-onload-submit]').length ) {
        return;
      }

      var timeoutMillis = $form.attr('data-form-timeout-submit');
      $form.removeAttr('data-form-timeout-submit');

      if( ! timeoutMillis.length ) {
        return;
      }

      var timeoutFormId = ''+Math.floor(Math.random() * 999999999)+''+Date.now();
      $form.attr('data-form-timeout-id',timeoutFormId);

      setTimeout(function () {
        timeoutFormSubmit(timeoutFormId);
      }, parseFloat(timeoutMillis));
    });
  }

  function timeoutFormSubmit(timeoutId) {
    var $form = $('[data-form-timeout-id="'+timeoutId+'"]');
    if( ! $form.length ) {
      return;
    }

    if( $form.attr('data-form-timeout-submit-input-name') &&
        $form.attr('data-form-timeout-submit-input-value') ) {
      $form
        .find('input[name="'+$form.attr('data-form-timeout-submit-input-name')+'"]')
        .val($form.attr('data-form-timeout-submit-input-value'));
    }

    if( $form.attr('data-form-timeout-submit-action') ) {
      $form.attr('action', $form.attr('data-form-timeout-submit-action'));

      if( $form.attr('data-form-timeout-submit-action-fallback') ) {
        $form.attr('action-fallback', $actor.attr('data-form-timeout-submit-action-fallback'));
      }
    }

    $loadingTarget = false;
    if( $form.attr('data-form-loading-target') ) {
      $loadingTarget = $($form.attr('data-form-result-target'));
    } else {
      $loadingTarget = $form.parent();
    }

    $loadingTarget.addClass('loading');
    
    if( $form.is('[data-form-ajax]') ) {
      submitFormAjax($form);
    } else {
      $form.submit();
    }
  }

  function handleFormSubmit($actor) {
    $form = $actor.closest('form');

    if( $actor.attr('data-form-submit-input-name') &&
        $actor.attr('data-form-submit-input-value') ) {
      $form
        .find('input[name="'+$actor.attr('data-form-submit-input-name')+'"]')
        .val($actor.attr('data-form-submit-input-value'));
    }

    if( $actor.attr('data-form-submit-action') ) {
      $form.attr('action', $actor.attr('data-form-submit-action'));

      if( $actor.attr('data-form-submit-action-fallback') ) {
        $form.attr('action-fallback', $actor.attr('data-form-submit-action-fallback'));
      }
    }

    $loadingTarget = false;
    if( $form.attr('data-form-loading-target') ) {
      $loadingTarget = $($form.attr('data-form-result-target'));
    } else {
      $loadingTarget = $form.parent();
    }

    $loadingTarget.addClass('loading');
    
    if( $form.is('[data-form-ajax]') ) {
      submitFormAjax($form);
    } else {
      $form.submit();
    }
  }

  function submitFormAjax ($form) {
    $resultTarget = false;
    if( $form.attr('data-form-result-target') ) {
      $resultTarget = $($form.attr('data-form-result-target'));
    } else {
      $resultTarget = $form.parent();
    }

    formRemoveAllAlerts($resultTarget, $form.attr('data-form-transition'));

    if( $form.find('input[type="file"]').length ) {
      
      // If we don't support FormData we have to try to use the fallback.
      if( ! ("FormData" in window) ) {
        return submitFormAjaxFileFallback($form);
      }

      return submitFormAjaxFileFormData($form);
    }

    // $form.serialize() is a piece.
    var formData = {};

    $form.find('input[type="hidden"], input[type="text"], input[type="password"], input[type="date"], input[type="datetime"], input[type="datetime-local"], input[type="month"], input[type="week"], input[type="email"], input[type="number"], input[type="search"], input[type="tel"], input[type="time"], input[type="url"], select, textarea').each(function () {
      formData[$(this).attr('name')] = $(this).val();
    });

    var checkboxValues = {};
    $form.find('input[type="checkbox"], input[type="radio"]').each(function () {
      if( $(this).is(':checked') ) {
        if( ! checkboxValues[$(this).attr('name')] ) {
          checkboxValues[$(this).attr('name')] = $(this).val();
        } else {
          checkboxValues[$(this).attr('name')] = checkboxValues[$(this).attr('name')]+','+$(this).val();
        }
      }
    });

    for( checkboxName in checkboxValues ) {
      formData[checkboxName] = checkboxValues[checkboxName];
    }

    $.ajax({
      url: $form.attr('action'),
      type: "POST",
      data: $.param(formData),
      dataType: 'json',
      success: function (response) {
        return handleFormAjaxSuccess(response, $form);
      },
      error: function (response, message, error) {
        return handleFormAjaxError(response, message, error, $form);
      }
    });
  }

  function submitFormAjaxFileFallback ($form) {
    if( ! $form.attr('action-fallback') ) {
      $resultTarget = false;
      if( $form.attr('data-form-result-target') ) {
        $resultTarget = $($form.attr('data-form-result-target'));
      } else {
        $resultTarget = $form.parent();
      }
      return formAddAlert($resultTarget, 'Error: missing fallback request target.  Please contact support.', 'error', $form.attr('data-form-transition'));
    }

    $form.attr('action', $form.attr('action-fallback'));
    $form.attr('enctype', 'multipart/form-data');
    $form.prepend($('<input type="hidden" name="MAX_FILE_SIZE" value="25000000" />'));
    $form.attr('method', 'POST');
    $form.submit();
  }

  function submitFormAjaxFileFormData ($form) {
    var formData = new FormData();
    formData.append('MAX_FILE_SIZE', '25000000');

    $form.find('input[type="hidden"], input[type="text"], input[type="password"], input[type="date"], input[type="datetime"], input[type="datetime-local"], input[type="month"], input[type="week"], input[type="email"], input[type="number"], input[type="search"], input[type="tel"], input[type="time"], input[type="url"], select, textarea').each(function () {
      formData.append($(this).attr('name'), $(this).val());
    });

    var checkboxValues = {};
    $form.find('input[type="checkbox"]').each(function () {
      if( $(this).is(':checked') ) {
        if( ! checkboxValues[$(this).attr('name')] ) {
          checkboxValues[$(this).attr('name')] = $(this).val();
        } else {
          checkboxValues[$(this).attr('name')] = checkboxValues[$(this).attr('name')]+','+$(this).val();
        }
      }
    });

    for( checkboxName in checkboxValues ) {
      formData.append(checkboxName, checkboxValues[checkboxName]);
    }

    // This does not support multi-select file inputs
    $form.find('input[type="file"]').each(function () {
      var fileInput = $(this).get(0);
      formData.append($(this).attr('name'), fileInput.files[0]);
    });

    $.ajax({
      url: $form.attr('action'),
      type: "POST",
      data: formData,
      processData: false,
      contentType: false,
      dataType: 'json',
      success: function (response) {
        return handleFormAjaxSuccess(response, $form);
      },
      error: function (response, message, error) {
        return handleFormAjaxError(response, message, error, $form);
      }
    });
  }

  function handleFormAjaxSuccess(response, $form) {
    if( response.callback_url ) {
      if( response.callback_url == window.location.href ) {
        window.location.reload(true);
      } else {
        window.location.href = response.callback_url;
      }
      return;
    }

    if( $form.attr('data-form-loading-target') ) {
      $loadingTarget = $($form.attr('data-form-result-target'));
    } else {
      $loadingTarget = $form.parent();
    }
    $loadingTarget.removeClass('loading');

    $resultTarget = false;
    if( $form.attr('data-form-result-target') ) {
      $resultTarget = $($form.attr('data-form-result-target'));
    } else {
      $resultTarget = $form.parent();
    }

    if( ! response.success ) {
      return formAddAlert($resultTarget, response.error, 'error', $form.attr('data-form-transition'));
    }

    return ajaxSuccessPreHide(response, $form);
  }

  function handleFormAjaxError(response, message, error, $form) {
    if( $form.attr('data-form-loading-target') ) {
      $loadingTarget = $($form.attr('data-form-result-target'));
    } else {
      $loadingTarget = $form.parent();
    }
    $loadingTarget.removeClass('loading');

    $resultTarget = false;
    if( $form.attr('data-form-result-target') ) {
      $resultTarget = $($form.attr('data-form-result-target'));
    } else {
      $resultTarget = $form.parent();
    }

    // Consider removing this after testing.
    return formAddAlert($resultTarget, 'Request error: '+message, 'info', $form.attr('data-form-transition'));
  }

  function ajaxSuccessPreHide(response, $form) {
    if( ! $form.attr('data-form-ajax-success-pre-hide-target') ) {
      return ajaxSuccessPreShow(response, $form);
    }

    formHideTarget(
      $($form.attr('data-form-ajax-success-pre-hide-target')), 
      $form.attr('data-form-transition'), 
      function () {
        return ajaxSuccessPreShow(response, $form);
      }
    );
  }

  function ajaxSuccessPreShow(response, $form) {
    if( ! $form.attr('data-form-ajax-success-pre-show-target') ) {
      return ajaxSuccessLoadViews(response, $form);
    }

    formShowTarget(
      $($form.attr('data-form-ajax-success-pre-show-target')), 
      $form.attr('data-form-transition'), 
      function () {
        return ajaxSuccessLoadViews(response, $form);
      }
    );
  }

  function ajaxSuccessLoadViews(response, $form) {
    $slideDownQueue = $();

    if( response.message ) {
      $resultTarget = false;
      if( $form.attr('data-form-result-target') ) {
        $resultTarget = $($form.attr('data-form-result-target'));
      } else {
        $resultTarget = $form.parent();
      }
      formAddAlert($resultTarget, response.message, 'success', $form.attr('data-form-transition'));
    }

    // Loop other views.
    for( viewIndex in response.data.views ) {
      $newView = $(response.data.views[viewIndex]);
      $newView.hide();
      $slideDownQueue.add($newView);

      if( $form.attr('data-form-ajax-success-view-'+viewIndex+'-replace-target') ) {
        $oldView = $($form.attr('data-form-ajax-success-view-'+viewIndex+'-replace-target'));
        $oldView.after($newView);
        $oldView.remove();
      } else {
        if( $form.attr('data-form-ajax-success-view-'+viewIndex+'-prepend-target') ) {
          $target = $($form.attr('data-form-ajax-success-view-'+viewIndex+'-prepend-target'));
          $target.prepend($newView);
        } else if( $form.attr('data-form-ajax-success-view-'+viewIndex+'-append-target') ) {
          $target = $($form.attr('data-form-ajax-success-view-'+viewIndex+'-append-target'));
          $target.append($newView);
        }
      }

      if( $form.attr('data-form-ajax-success-view-'+viewIndex+'-fire-event') ) {
        formShowTarget(
          $newView, 
          $form.attr('data-form-transition'), 
          function () {
            $newView.trigger($form.attr('data-form-ajax-success-view-'+viewIndex+'-fire-event'));
          }
        );
      } else {
        formShowTarget(
          $newView, 
          $form.attr('data-form-transition')
        );
      }
    }

    if( ! $slideDownQueue.length ) {
      return ajaxSuccessPostHide(response, $form);
    }

    formShowTarget(
      $slideDownQueue, 
      $form.attr('data-form-transition'), 
      function () {
        ajaxSuccessPostHide(response, $form);
      }
    );
  }

  function ajaxSuccessPostHide(response, $form) {
    if( ! $form.attr('data-form-ajax-success-post-hide-target') ) {
      return ajaxSuccessPostShow(response, $form);
    }

    formHideTarget(
      $($form.attr('data-form-ajax-success-post-hide-target')), 
      $form.attr('data-form-transition'), 
      function () {
        return ajaxSuccessPostShow(response, $form);
      }
    );
  }

  function ajaxSuccessPostShow(response, $form) {
    if( ! $form.attr('data-form-ajax-success-post-show-target') ) {
      return ajaxSuccessCallback(response, $form);
    }

    formShowTarget(
      $($form.attr('data-form-ajax-success-post-show-target')), 
      $form.attr('data-form-transition'), 
      function () {
        return ajaxSuccessCallback(response, $form);
      }
    );
  }

  function ajaxSuccessCallback(response, $form) {
    if( ! $form.attr('data-form-ajax-success-callback') ) {
      return;
    }

    window[$form.attr('data-form-ajax-success-callback')](response, $form);

    return;
  }

  // Helpers for UI
  
  function formAddAlert($target, alertText, alertClass, transition, callback) {
    if( ! alertClass ) { alertClass = 'info'; }
    if( ! callback ) { callback = function () {}; }
    var $alert = $('<div data-alert="" class="alert-box '+alertClass+'">'+alertText+'<a href="#" class="close">×</a></div>');
    $alert.css('display','none');
    $target.prepend($alert);
    formShowTarget(
      $alert,
      transition,
      callback
    );
  }

  // Remove immediate alert children from $target
  function formRemoveAllAlerts($target, transition) {
    $target.children('.alert-box').each(function () {
      var $alertBox = $(this);
      formHideTarget(
        $alertBox,
        transition,
        function () {
          $alertBox.remove();
        }
      );
    });
  }

  function formHideTarget($target, transition, callback) {
    if( ! transition ||
        Array('slide','fade').indexOf(transition) < 0 ) {
      transition = 'slide';
    }

    if( ! callback ) { 
      callback = function () { /* NADA */ };
    }

    if( transition == 'slide' ) {
      return $target.slideUp().promise().done(callback);
    }

    if( transition == 'fade' ) {
      return $target.fadeOut().promise().done(callback);
    }
  }

  function formShowTarget($target, transition, callback) {
    if( ! transition ||
        Array('slide','fade').indexOf(transition) < 0 ) {
      transition = 'slide';
    }

    if( ! callback ) { 
      callback = function () { /* NADA */ };
    }

    if( transition == 'slide' ) {
      return $target.slideDown().promise().done(callback);
    }

    if( transition == 'fade' ) {
      return $target.fadeIn().promise().done(callback);
    }
  }
});