$(document).ready(function() {
  try {
    console.log('HNApp Loaded...');

    var $LoginBtn = $('.loginbtn'),
        $PopupContainer = $('#loginpopup'),
        $PopupMessageBar = $PopupContainer.find('.messagebar'),
        $UsernameInput = $PopupContainer.find('.loginusername'), $PasswordInput = $PopupContainer.find('.loginpassword'),
        $LoginActionBtn = $('.loginaction'), $CreateActionBtn = $('.createaction'),
        $VoteBtn = $('.votebtn'),
        $OperationsAnchor = $PopupContainer.find('.otherops a');
    
    var $PostsSection = $('#postssection');

    function onLoginBtnClickHdlr(e) {
      $PopupContainer.toggleClass('hidden');
    }
    function onLoginActionClickHdlr(e) {
      if( ValidateUserPassInputs() ) {
        clearErrorInfo();
        $LoginForm = $('.loginform');
        $LoginForm.attr('action', '/login');
        $LoginForm.submit();  
      }
    }
    function clearErrorInfo() {
      $PopupMessageBar.removeClass('errorMessage'); $PopupMessageBar.html(''); $PopupMessageBar.addClass('hidden');
      $UsernameInput.removeClass('errorField');
      $PasswordInput.removeClass('errorField');
    }
    function ShowErrorMessage(msg) {
      $PopupMessageBar.addClass('errorMessage'); $PopupMessageBar.removeClass('hidden');
      $PopupMessageBar.html(msg);
    }
    function ShowErrorField($Inputfield ) {
      $Inputfield.addClass('errorField');
    }
    function onCreateActionClickHdlr(e) {
      if( ValidateUserPassInputs() ) {
        $LoginForm = $('.loginform');
        $LoginForm.attr('action', '/users');
        $LoginForm.submit();  
      }
    }
    function ValidateUserPassInputs() {
      var username = $UsernameInput.val();
      var password = $PasswordInput.val();
      clearErrorInfo();

      if( !username ) {
        ShowErrorMessage('Username field is missing');
        ShowErrorField($UsernameInput);
        return;
      }
      if( !password ) {
        ShowErrorMessage('Password field is missing');
        ShowErrorField($PasswordInput);
        return;
      }
      return true;
    }
    
    function onOperationsChange(e) {
      var opsClicked = $(this).attr('data-oprname');
      console.log(opsClicked);
      switch(opsClicked) {
        case 'login': showLoginPanel(); break;
        case 'create': showSignPanel(); break;
      }
    }
    function ClearInputFields() {
      clearErrorInfo();
      $UsernameInput.val('');
      $PasswordInput.val('');
    }
    function showLoginPanel() {
      ClearInputFields();

      $PopupContainer.find('[data-label=password]').removeClass('hidden');
      $PopupContainer.find('.loginpassword').removeClass('hidden');

      $PopupContainer.find('.buttonsection button').addClass('hidden');
      $LoginActionBtn.removeClass('hidden');

      $OperationsAnchor.removeClass('hidden');
      $OperationsAnchor.filter('.loginOpsLabel').addClass('hidden');
    }
    function showSignPanel() {
      ClearInputFields();

      $PopupContainer.find('[data-label=password]').removeClass('hidden');
      $PopupContainer.find('.loginpassword').removeClass('hidden');

      $PopupContainer.find('.buttonsection button').addClass('hidden');
      $CreateActionBtn.removeClass('hidden');

      $OperationsAnchor.removeClass('hidden');
      $OperationsAnchor.filter('.createOpsLabel').addClass('hidden');
    }


    function extractQueryParams(url) {
      var url = location.href;
      var queryPart = url.substring(url.indexOf('?') + 1);
      var splittedParts = queryPart.split('&');
      var paramsObj = {};
      if( splittedParts && Array.isArray(splittedParts) ) {
        splittedParts.forEach(function(part) {
          var key = part.split("=")[0];
          var value = part.split("=")[1];
          paramsObj[key] = value;
        });
      }

      return paramsObj;
    }
    function renderPosts() {
      var url = location.href;
      var queryParams = extractQueryParams(url); 
      console.log(queryParams);
      $.ajax({
        'type': 'get',
        'url': '/posts' + ( queryParams && queryParams.page ? '?page='+ queryParams.page : ''),
        'success': function(res) {

          console.log(res);
          if( res && res['success'] ) {
            var postsArray = res.data;

            if( Array.isArray(postsArray) ) {
              postsArray.forEach(function(post) {
                var $PostsHTML = composePostsHTML(post)
                $PostsSection.append($PostsHTML);
              });
            }

            // Render next, page idx
            var hasNextPage = res.hasnextpage;
            var hasPrevPage = res.hasprevpage;

            var $PrevPageBtn;
            if( hasPrevPage ) {
              $PrevPageBtn = '<button class="paginationButton" onclick=location.href="/?page='+ res.prevpageidx +'">Prev Page</button>';
            } else {
              $PrevPageBtn = '<button class="paginationButton" disabled>Prev Page</button>';
            }
            $('#pagintionsection').append($PrevPageBtn);

            var $NextPageBtn;
            if( hasNextPage ) {
              $NextPageBtn = '<button class="paginationButton" onclick=location.href="/?page='+ res.nextpageidx +'">Next Page</button>';
            } else {
              $NextPageBtn = '<button class="paginationButton" disabled>Next Page</button>';
            }
            $('#pagintionsection').append($NextPageBtn);

          }

          $('.votebtn').on('click', onVoteBtnClickHdlr);

        },
        'error': function(err) {
          console.log('Error occured while fetching posts data.');
        }
      });
    }
    function composePostsHTML(post) {
      var $template;
      try {
        $template = 
          '<div class="post">'+
          '<div class="votesection">'+
            '<a href="#" class="votebtn" data-postid="'+ post._id +'"><img src="/images/upvote.gif" width="10" height="10"></a>'+
            '<span class="votecount">'+ post.votecount +'</span>'+
          '</div>'+
          '<div class="detailsection">'+
            '<a href="'+ post.url +'" class="posttitle">'+ post.title +'</a>'+
            '<span class="postdetail">'+ moment(post.time).fromNow() +' by <a href="/user/'+ post.username +'" class="user">'+ post.username +'</a></span>'+
            '</div>'+
          '</div>';
      }catch(e) {
        console.log('Error in composing template data. '+ post);
      }

      return $template;
    }


    function onVoteBtnClickHdlr(e) {
      var $PostEle = $(this);
      var $VoteCountEle = $PostEle.siblings('.votecount');
      var postId = $PostEle.attr('data-postid');

      console.log('Upvote for Post with Id '+ postId);
      $.ajax({
        type: 'post',
        url: '/castvote',
        data: {
          'postid': postId
        },
        success: function(res) {
          console.log('Upvote Result ', res);
          if( res.success ) {
            
            var voteCount = +res.upvotecount;
            $VoteCountEle.text(voteCount);

            if( res.upvoted ) {
              $VoteCountEle.addClass('starred');
            } else {
              $VoteCountEle.removeClass('starred');
            }

          } else {  
            //TODO: Display in any message box instead of browser alert.
            alert(res.message);
          }
        },
        error: function(err) {
          //TODO
        }
      });
    }
    function Init() {
      renderPosts();

      //Binding Event handlers
      $LoginBtn.on('click', onLoginBtnClickHdlr);
      $LoginActionBtn.on('click', onLoginActionClickHdlr);
      $CreateActionBtn.on('click', onCreateActionClickHdlr);
      $OperationsAnchor.on('click', onOperationsChange);
    }
    Init();
  } catch(e) {
    console.log(e);
  }
});

