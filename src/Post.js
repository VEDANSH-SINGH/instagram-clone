import React, { useEffect, useState, setState } from 'react'
import "./Post.css"
import Avatar from "@material-ui/core/Avatar"
import { storage, db, auth } from './firebase';
import firebase from 'firebase';
import { StepContent } from '@material-ui/core';

function Post({postId, username, user, caption, imageUrl, imagename, viewwhichuser}) {
    const [comments, setComments] = useState([]);
    const [comment, setComment] = useState([]);
    const [commentId, setCommentId] = useState("null");
    const [commentsId, setCommentsId] = useState("null");
    const [count, setCount] = useState(0);


    // What follows is for comments under a post, when a change is made, it refreshes
    useEffect(() => {
        let unsubscribe;
        if (postId) {
            unsubscribe = db
                .collection("posts")
                .doc(postId)
                .collection("comments")
                .orderBy('timestamp', 'asc')
                .onSnapshot((snapshot) => {
                    setComments(snapshot.docs.map((doc) => doc.data()));
                })
        }

        return () => {
            unsubscribe();
        };
    }, [postId]);


    const postComment = (event) => {
        event.preventDefault();
        db.collection("posts").doc(postId).collection("comments").add({
            text: comment,
            username: user.displayName,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        setComment('');
            
    }

    function deletePost(postId) {
        // event.preventDefault();
        
        db.collection("posts").doc(postId).delete().then(function() {
            console.log("Document successfully deleted!");
        }).catch(function(error) {
            console.log("Error removing document: ", error);            
        });
        // Get a reference to the storage service, which is used to create references in your storage bucket
        var storage = firebase.storage();

        // Create a storage reference from our storage service
        var storageRef = storage.ref();

        // Create a reference to the file to delete
        var desertRef = storageRef.child('images/'+imagename);

        // Delete the file
        desertRef.delete().then(function() {
        // File deleted successfully
    
        }).catch(function(error) {
        // Uh-oh, an error occurred!

        });
    
    }


    const deleteComment = (event) => {

        event.preventDefault();

        db.collection("posts").doc(postId).collection("comments").where("text", "==", event.target.commentToDel.value)
        .get()
        .then(function(querySnapshot) {
            querySnapshot.forEach(function(doc) {

            setCommentId(doc.id, " => ", doc.data())
            })
            
            // code to delete comment here
            deleteCommentAction(commentId)

        })
        .catch(function(error) {
            console.log("Error getting documents:", error);
        })

    }

    function deleteCommentAction(comId){

        // code to delete comment here
        db.collection("posts").doc(postId).collection("comments").doc(comId).delete().then(function() {
            console.log("Document successfully deleted!"+commentId);
        }).catch(function(error) {
            console.log("Error removing document:", error);            
        });
    
        // This is a very dirty hack to go around the issue whereI have to click twice to delete a comment
        //document.getElementById("delete__CommentButton").click();
    }


    function backtotop(){
        document.body.scrollTop = 0; // For Safari
        document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
    }

    // Function to view others' posts
    function viewtheirstuff(userselected) { 
        viewwhichuser(userselected);
        backtotop();
    }
     
    return (
        <div className="post">
            <div className="post__header">
                <Avatar 
                    className="post__avatar"
                    alt={username}
                    src="/static/images/avatar/1.jpg"
                    onClick={viewtheirstuff.bind(this, username) }
                />
                <div className="post__username" onClick={viewtheirstuff.bind(this, username)}>
                    <h3>{username} </h3>
                </div>
                {
                    user && username === auth.currentUser.displayName
                    && 
                    <div className="delete__Post" onClick={deletePost.bind(this, postId)}>
                        <h5>DELETE POST</h5>
                    </div>
                    
                }
                
            </div>

            <div className="post__imgcontainer">

                { 
                // Check if the image is a video instead of an image, and if so, use the VIDEO tag instead
                (imageUrl.includes(".mp4")) || (imageUrl.includes(".MP4")) || (imageUrl.includes(".mov")) || (imageUrl.includes(".MOV")) 
                ? 
                    (
                    <video width="100%" max-width="500" controls="true" autoplay="true" loop="true" muted="true" playsinline="true">
                        <source src={imageUrl} type='video/mp4'></source>
                        Your browser does not support the video tag.
                    </video>
                    )
                    : 
                    (
                    // If it is NOT a video, load it as an image:
                    <img className="post__image" src={imageUrl} alt="" />
                    )
                }

            </div>            

            <h4 className="post__text"><strong onClick={viewtheirstuff.bind(this, username)}>{username}: </strong>{caption}</h4>

            
            <div className="post__comments">
                {comments.map((comment) => (

                    <p className="post__comment">
                        <strong onClick={viewtheirstuff.bind(this, comment.username)}>
                            {comment.username}: 
                        </strong> {comment.text} 
                        {
                            user && comment.username === auth.currentUser.displayName
                            &&
                            <div id="delete__CommentButton"  className="delete__CommentButton">
                                <h5 >
                                    <form onSubmit={deleteComment}>
                                        <input
                                            type="hidden"
                                            name="commentToDel"
                                            value={comment.text}
                                        >
                                        </input>
                                        <button
                                            className="button__delComment"
                                            type="submit"
                                            onChange={(e) => setCommentId(e.target.value)}
                                        >
                                            DELETE
                                        </button>
                                    </form> 
                                </h5>
                            </div>

                        }
                    </p>
                    
                ))}
            </div>


                {user && ( // Only display this comment form input if the user has logged in
                    <form className="post__commentBox">
                        <input 
                            className="post__input"
                            type="text"
                            placeholder="Add a comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />

                        <button
                            className="post__button"
                            disable={!comment}
                            type="submit"
                            onClick={postComment}
                        >
                            Post
                        </button>
                    </form>
                )}
        </div>
    )
}

export default Post
