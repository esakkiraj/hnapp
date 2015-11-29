function validateForm(e) {
   var $MessageBar = $('.messagebar');
   var $URLBar = $('.urlBox');

    var urlText = $URLBar.val().trim();
    if( !urlText ) { 
      $MessageBar.text('URL field cannot be empty.'); 
      $MessageBar.removeClass('hidden');
      $MessageBar.addClass('errorMessage');

      $URLBar.addClass('errorField');

      return false;
      e.preventDefault();
    }
    return true;
}

