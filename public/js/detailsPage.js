function returnConcertRating(rating) {
    
    let returnRating = document.createElement('span');
    let stars = "";
    
    for (let i = 0;i<Math.round(rating);i++) {
        stars += "&#9733;";
    }
    for (let i = 0; i < 5 - Math.round(rating);i++) {
        stars += "&#9734;";
    }
    returnRating.innerHTML = stars;
    
    document.querySelector('#ratingSection > a').prepend(returnRating);
};
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
    updateFollowStatus(true, true);
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
    updateFollowStatus(false, true);
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
async function attendConcert(e) {
    e.stopPropagation();
    let result = await fetch(`/concerts/${concertId}/attend`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            myId: userId,
        })
    });
    let data = await result.json();
    if (!data) {
        console.error('Error Attending Concert');
    }
    else {
        updateAttendStatus(true, true);
        addAttendee();
    }
};
async function unattendConcert(e) {
    e.stopPropagation();
    let result = await fetch(`/concerts/${concertId}/attend`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            myId: userId,
        })
    });
    let data = await result.json();
    if (!data) {
        console.error('Error Unattending Concert');
    }
    else {
        updateAttendStatus(false, true);
        removeAttendee();
    }
};
/**
 * 
 * @param {bool} isAttending - is user attending the concert
 * @param {bool} afterPageLoad - Altering visibility of buttons after page already loaded
 */
 function updateAttendStatus(isAttending, afterPageLoaded = false) {
    let btnAttend = document.getElementById('attend');
    let btnUnattend = document.getElementById('unattend');
    if (isAttending) {
        if (afterPageLoaded) {
            btnAttend.removeEventListener('click', attendConcert);
            btnAttend.classList.toggle('hide');
            btnUnattend.classList.toggle('hide');
        }
        else {
            btnAttend.classList.toggle('hide');
        }
        btnUnattend.addEventListener('click', unattendConcert);
    }
    else {
        if (afterPageLoaded) {
            btnUnattend.removeEventListener('click', unattendConcert);
            btnUnattend.classList.toggle('hide');
            btnAttend.classList.toggle('hide');
        }
        else {
            btnUnattend.classList.toggle('hide');
        }
        btnAttend.addEventListener('click', attendConcert);
    }
}
function hideAttendButtons() {
    let btnAttend = document.getElementById('attend');
    let btnUnattend = document.getElementById('unattend');
    btnAttend.classList.toggle('hide');
    btnUnattend.classList.toggle('hide');
}
function addAttendee() {
    if (document.querySelector('.attendeesContainer > p') != null) {
        document.querySelector('.attendeesContainer > p').remove();
    }

    let attendeeTag = document.createElement('div');
    attendeeTag.classList.toggle('attendee');
    attendeeTag.setAttribute('id', currentUser);

    let imageTag = document.createElement('div');
    imageTag.classList.toggle('profileImage');
    imageTag.style.backgroundImage = "url('" + userImage + "')";

    let userTag = document.createElement('p');
    userTag.textContent = currentUser;

    attendeeTag.appendChild(imageTag);
    attendeeTag.appendChild(userTag);
    
    document.querySelector('.attendeesContainer').appendChild(attendeeTag);
    
}
function removeAttendee() {
    if (document.querySelector('.attendeesContainer').childElementCount === 1) {
        let noUsers = document.createElement('p');
        noUsers.textContent = "No one is going yet";
        document.getElementById(currentUser).remove();
        document.querySelector('.attendeesContainer').appendChild(noUsers);
    }
    else {
        document.getElementById(currentUser).remove();
    }
    
}

if (!userAuthorMatch && isLoggedIn) {
    updateFollowStatus(following);
        if (attending) {
            updateAttendStatus(true);
        }
        else {
            updateAttendStatus(false);
        }
}
else {
    if (isLoggedIn) {
        hideFollowButtons();
        hideAttendButtons();
    }
}