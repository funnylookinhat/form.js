##Form Handler

__<form>__
- data-form-ajax
- data-form-result-target / Default to FORM parent?
- data-form-loading-target / Default to FORM parent?
- data-form-transition / Default to "slide" - can also be "fade"

- data-form-onload-submit / Boolean to submit as soon as loaded.
- data-form-timeout-submit / Time in milliseconds to wait before auto submitting
- data-form-timeout-submit-action / Action to submit to on timeout
- data-form-timeout-submit-input-name / Input to change value of on timeout submit
- data-form-timeout-submit-input-value / Value to change input to on timeout submit

- data-form-ajax-success-pre-hide-target -> An ID to slideUp after a successful response.
- data-form-ajax-success-pre-show-target -> An ID to slideDown after a successful response.
- data-form-ajax-success-post-hide-target -> An ID to slideUp after replacing the form.
- data-form-ajax-success-post-show-target -> An ID to slideDown after replacing the form.
- data-form-ajax-success-callback -> A javascript function to run.

// The following are not implemented yet.
- data-form-ajax-error-pre-show-target -> An ID to slideUp after a failed response.
- data-form-ajax-error-pre-show-target -> An ID to slideDown after a failed response.
- data-form-ajax-error-post-hide-target -> An ID to slideUp after failed response adds an alert.
- data-form-ajax-error-post-show-target -> An ID to slideDown after failed response adds an alert.
- data-form-ajax-error-callback -> A javascript function to run.

For response.data.views we require:

- data-form-ajax-success-view-VIEW-replace-target -> Replaces the selector with the new view.
- data-form-ajax-success-view-VIEW-prepend-target -> Prepends the new view to the selector.
- data-form-ajax-success-view-VIEW-append-target -> Appends the new view to the selector.

__<input>__ or __<a>__
- data-form-enter-submit
- data-form-click-submit
- data-form-change-submit
- data-form-submit-action
- data-form-submit-fallback-action
- data-form-submit-input-name
- data-form-submit-input-value


