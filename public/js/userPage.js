async function followUser(e) {
    e.stopPropagation();
    let result = await fetch('/follow', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            myId: userId,
            authorId: authorId,
        })
    });
    let data = await result.json();
    if (data !== null) {
        updateFollowStatus(true, true);
        addFollower();
    }
    else {
        console.error('Error following user.');
    }
};
async function unFollowUser(e) {
    e.stopPropagation();
    let result = await fetch('/follow', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            myId: userId,
            authorId: authorId,
        })
    });
    let data = await result.json();
    if (data !== null) {
        updateFollowStatus(false, true);
        removeFollower();
    }
    else {
        console.error('Error unfollowing user.');
    }
};
/**
 * 
 * @param {bool} isFollowing - is user following the concert author
 * @param {bool} afterPageLoad - Altering visibility of buttons after page already loaded
 */
function updateFollowStatus(isFollowing, afterPageLoaded = false) {
    let btnFollow = document.getElementById('follow');
    let btnUnfollow = document.getElementById('unfollow');
    if (isFollowing) {
        if (afterPageLoaded) {
            btnFollow.removeEventListener('click', followUser);
            btnFollow.classList.toggle('hide');
            btnUnfollow.classList.toggle('hide');
        }
        else {
            btnFollow.classList.toggle('hide');
        }
        btnUnfollow.addEventListener('click', unFollowUser);
    }
    else {
        if (afterPageLoaded) {
            btnUnfollow.removeEventListener('click', unFollowUser);
            btnUnfollow.classList.toggle('hide');
            btnFollow.classList.toggle('hide');
        }
        else {
            btnUnfollow.classList.toggle('hide');
        }
        btnFollow.addEventListener('click', followUser);
    }
}
function hideFollowButtons() {
    let btnFollow = document.getElementById('follow');
    let btnUnfollow = document.getElementById('unfollow');
    btnFollow.classList.toggle('hide');
    btnUnfollow.classList.toggle('hide');
}
function addFollower() {
    if (document.querySelector('.followersContainer > p') != null) {
        document.querySelector('.followersContainer > p').remove();
    }

    let followerTag = document.createElement('div');
    followerTag.classList.toggle('follower');
    followerTag.setAttribute('id', currentUser);

    let imageTag = document.createElement('div');
    imageTag.classList.toggle('profileImage');
    imageTag.style.backgroundImage = "url('" + userImage + "')";

    let userTag = document.createElement('p');
    userTag.textContent = currentUser;

    followerTag.appendChild(imageTag);
    followerTag.appendChild(userTag);
    
    document.querySelector('.followersContainer').appendChild(followerTag);
    
}
function removeFollower() {
    if (document.querySelector('.followersContainer').childElementCount === 1) {
        let noUsers = document.createElement('p');
        noUsers.textContent = author + " has no followers yet";
        document.getElementById(currentUser).remove();
        document.querySelector('.followersContainer').appendChild(noUsers);
    }
    else {
        document.getElementById(currentUser).remove();
    }
    
}

if (!userAuthorMatch && isLoggedIn) {
    updateFollowStatus(following);
}
else {
    if (isLoggedIn) {
        hideFollowButtons();
    }
}