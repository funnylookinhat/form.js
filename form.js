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
    $alerts = $resultTarget.find('.alert-box');
    
    $alerts.each(function () {
      $target = $(this);
      hideTarget($target, 'slide', function () {
        $target.remove();
      });
      // REPLACED
      /*
      $(this).slideUp(function () {
        $(this).remove();
      });
      */
    });

    // TODO - DETECT IE
    // if (!("FormData" in window)) { }

    var formData = new FormData();
    formData.append('MAX_FILE_SIZE', '25000000');

    $form.find('input[type="hidden"], input[type="text"], input[type="email"], input[type="tel"], input[type="password"], select, textarea').each(function () {
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
      return addAlert($resultTarget, response.error, 'error');
    }

    if( response.callback_url ) {
      if( response.callback_url == window.location.href ) {
        window.location.reload(true);
      } else {
        window.location.href = response.callback_url;
      }
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
    return addAlert($resultTarget, 'Request error: '+message, 'info');
  }

  function ajaxSuccessPreHide(response, $form) {
    if( ! $form.attr('data-form-ajax-success-pre-hide-target') ) {
      return ajaxSuccessPreShow(response, $form);
    }

    hideTarget(
      $($form.attr('data-form-ajax-success-pre-hide-target')), 
      $form.attr('data-form-transition'), 
      function () {
        return ajaxSuccessPreShow(response, $form);
      }
    );

    // REPLACED
    /*
    $($form.attr('data-form-ajax-success-pre-hide-target')).slideUp(function () {
      return ajaxSuccessPreShow(response, $form);
    });
    */
  }

  function ajaxSuccessPreShow(response, $form) {
    if( ! $form.attr('data-form-ajax-success-pre-show-target') ) {
      return ajaxSuccessLoadViews(response, $form);
    }

    showTarget(
      $($form.attr('data-form-ajax-success-pre-show-target')), 
      $form.attr('data-form-transition'), 
      function () {
        return ajaxSuccessLoadViews(response, $form);
      }
    );

    /*
    $($form.attr('data-form-ajax-success-pre-show-target')).slideDown(function () {
      return ajaxSuccessLoadViews(response, $form);
    });
    */
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
      addAlert($resultTarget, $response.message, 'success');
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
        showTarget(
          $newView, 
          $form.attr('data-form-transition'), 
          function () {
            $newView.trigger($form.attr('data-form-ajax-success-view-'+viewIndex+'-fire-event'));
          }
        );
        /*
        $newView.slideDown(function () {
          $newView.trigger($form.attr('data-form-ajax-success-view-'+viewIndex+'-fire-event'));
        });
        */
      } else {
        showTarget(
          $newView, 
          $form.attr('data-form-transition')
        );
        /*
        $newView.slideDown();
        */
      }
    }

    if( ! $slideDownQueue.length ) {
      return ajaxSuccessPostHide(response, $form);
    }

    showTarget(
      $slideDownQueue, 
      $form.attr('data-form-transition'), 
      function () {
        ajaxSuccessPostHide(response, $form);
      }
    );

    /*
    $slideDownQueue.slideDown(function () {
      ajaxSuccessPostHide(response, $form);
    });
    */
  }

  function ajaxSuccessPostHide(response, $form) {
    if( ! $form.attr('data-form-ajax-success-post-hide-target') ) {
      return ajaxSuccessPostShow(response, $form);
    }

    hideTarget(
      $($form.attr('data-form-ajax-success-post-hide-target')), 
      $form.attr('data-form-transition'), 
      function () {
        return ajaxSuccessPostShow(response, $form);
      }
    );

    /*
    $($form.attr('data-form-ajax-success-post-hide-target')).slideUp(function () {
      return ajaxSuccessPostShow(response, $form);
    });
    */
  }

  function ajaxSuccessPostShow(response, $form) {
    if( ! $form.attr('data-form-ajax-success-post-show-target') ) {
      return;
    }

    showTarget(
      $($form.attr('data-form-ajax-success-post-show-target')), 
      $form.attr('data-form-transition'), 
      function () {
        return;
      }
    );

    /*
    $($form.attr('data-form-ajax-success-post-show-target')).slideDown(function () {
      return;
    });
    */
  }

  // Helpers for UI
  function hideTarget($target, transition, callback) {
    if( ! transition ||
        Array('slide','fade').indexOf(transition) < 0 ) {
      transition = 'slide';
    }

    if( ! callback ) { 
      callback = function () { /* NADA */ };
    }

    if( transition == 'slide' ) {
      return $target.slideUp(callback);
    }

    if( transition == 'fade' ) {
      return $target.fadeOut(callback);
    }
  }

  function showTarget($target, transition, callback) {
    if( ! transition ||
        Array('slide','fade').indexOf(transition) < 0 ) {
      transition = 'slide';
    }

    if( ! callback ) { 
      callback = function () { /* NADA */ };
    }

    if( transition == 'slide' ) {
      return $target.slideDown(callback);
    }

    if( transition == 'fade' ) {
      return $target.fadeIn(callback);
    }
  }
});