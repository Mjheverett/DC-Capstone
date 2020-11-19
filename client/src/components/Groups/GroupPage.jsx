import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { fade, makeStyles } from '@material-ui/core/styles';
import { Container, Typography, GridList, GridListTile, Button, TextField, Card, CardHeader, CardContent, Avatar}  from '@material-ui/core';
import { useAuth0 } from '@auth0/auth0-react';
import moment from 'moment';
import { Link, Redirect } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
    inputRoot: {
        color: 'primary',
    },
    groupBar: {
        margin: theme.spacing(2),
        padding: theme.spacing(2),
        borderRadius: '4px',
        width: 'auto',
    },
    membersDiv:{
        position: 'relative',
        borderRadius: '5px',
        background: '#768B91',
        textAlign: 'center',
        color: '#002B36',
        padding: '0.8rem 1.6rem',
        marginBottom: '2rem',
        maxWidth: "550px",
    },
    commentsDiv:{
        position: 'relative',
        borderRadius: '5px',
        background: '#768B91',
        textAlign: 'center',
        color: '#002B36',
        padding: '0.8rem 1.6rem',
        marginBottom: '2rem',
    },
    gridList: {
        flexWrap: 'wrap',
        transform: 'translateZ(0)',
    },
    margin: {
        margin: theme.spacing(2),
    },
    textField: {
        position: 'relative',
        width: '100%',
        maxWidth: "600px",
        color: '#93A1A1',
        borderRadius: theme.shape.borderRadius,
        backgroundColor: fade(theme.palette.common.white, 0.15),
        '&:hover': {
            backgroundColor: fade(theme.palette.common.white, 0.15),
        },
    },
    avatar: {
        backgroundColor: '#52781e',
    },
    avatarAdmin: {
        backgroundColor: '#244B00',
    },
    card: {
        width: 'auto',
        margin: theme.spacing(2),
        padding: theme.spacing(2),
        backgroundColor: fade(theme.palette.common.white, 0.15),
        color: '#002B36',
        textAlign: 'left',
        fontSize: '1rem',
    },
    commentsMobile: {
        display: 'inlineBlock',
        width: '100%',   
    },
}));

const GroupPage = () => {
    const classes = useStyles();
    const [group, setGroup] = useState(null);
    const [newComment, setNewComment] = useState('');
    const [comments, setComments] = useState([]);
    const groupId = useParams();
    const { user } = useAuth0();
    const [fireRedirect, setRedirect] = useState(false);
    const url = process.env.REACT_APP_API_URL;
    
    //Grabbing screen width on load. Pulling into comments classes.
    const lWidth = window.screen.width;
    // console.log("screen width is",lWidth);

    useEffect(() => {
        axios.get(`${url}/groups/group/${groupId.id}`)
            .then(res => {
                const data = res.data;
                setGroup(data);
            })
            .catch(err => console.log(err));
        axios.get(`${url}/groups/comments/${groupId.id}`)
            .then(res => {
                const data = res.data;
                // console.log("comment response data", data);
                setComments(data);
            })
            .catch(err => console.log(err));
    }, [groupId.id]);

    const _handleJoinGroup = async (e) => {
        e.preventDefault();
        const data = {
            groupId: group.id
        };
        await axios.post(`${url}/groups/join/${user.sub}`, data)
            .then(res => console.log(res))
            .catch(err => console.log(err));
        await axios.get(`${url}/groups/group/${groupId.id}`)
            .then(res => {
                const data = res.data;
                setGroup(data);
            })
            .catch(err => console.log(err));
    };

    const _handleLeaveGroup = async (e) => {
        e.preventDefault();
        const data = {
            groupId: group.id,
            userId: user.sub
        };
        await axios.delete(`${url}/groups/${groupId.id}/${user.sub}`, data)
            .then(res => console.log("leave group response", res))
            .catch(err => console.log(err));
        await axios.get(`${url}/groups/group/${groupId.id}`)
            .then(res => {
                const data = res.data;
                setGroup(data);
            })
            .catch(err => console.log(err));
    };
    const _handleDeleteGroup = async (e) => {
        e.preventDefault();
        await axios.delete(`${url}/groups/delete/${groupId.id}`)
            .then(res => console.log("leave group response", res))
            .catch(err => console.log(err));
        await setRedirect(true)
    };

    const _handleComment = (data) => {
        setNewComment(data);
    }

    const _handleAddComment = async (e) => {
        e.preventDefault();
        const data = {
            userId: user.sub,
            content: newComment
        }
        // console.log("add comment data", data);
        await axios.post(`${url}/groups/comments/add/${groupId.id}`, data)
            .then(res => console.log(res))
            .catch(err => console.log(err));
        await axios.get(`${url}/groups/comments/${groupId.id}`)
            .then(res => {
                const data = res.data;
                // console.log("comment response data", data);
                setComments(data);
            })
            .catch(err => console.log(err));   
        setNewComment('');
    }

    // return while waiting on axios, then render updated page
    if (group === null) {
        return (
            <>
                <Typography variant="h6">Loading</Typography>
            </>
        )
    }

    return (
        <Container maxWidth="lg" style={{marginTop: '2rem'}}>
            <Typography variant="h2">{group.groupName}</Typography>
            <br/>
            <Typography variant="h6">{group.groupDescription}</Typography>
            <br/>
                {group.Users.find(({id})=> id === user.sub) ?
                group.Users[0].id !== user.sub ? 
                    <form style={{marginTop: '1rem'}} onSubmit={_handleLeaveGroup}>
                    <input value={group.id} name="groupId" hidden></input>
                <Button type="submit" color="secondary" variant="contained" size="large">Leave This Group</Button>
                </form>
                :
                <form style={{marginTop: '1rem'}} onSubmit={_handleDeleteGroup}>
                    <input value={group.id} name="groupId" hidden></input>
                    <Button type="submit" color="secondary" variant="contained" size="large">Delete This Group</Button>
                </form> 
                
                : 
                <form onSubmit={_handleJoinGroup}>
                    <input value={group.id} name="groupId" hidden></input>
                    <Button type="submit" color="secondary" variant="contained" size="large">Join This Group</Button>
                </form>
                }
                {fireRedirect &&
                    <Redirect 
                        to={{
                            pathname: '/groups',
                        }}
                    />}
            <br />
            <Typography variant="h6">Members</Typography>
            <div className={classes.membersDiv}>
                <GridList className={classes.gridList} cols={1} cellHeight={'auto'}>
                    {(group.Users.length !== 0) ? (group.Users.map(user => (
                        <GridListTile cellHeight={'auto'} key={user.id}>
                        {!!user.user_group.isAdmin ?
                        <>  
                            <Card className={classes.card} style={{background: '#52781e'}}>
                                <CardHeader
                                    avatar={
                                        <Avatar className={classes.avatarAdmin}>
                                            {user.name[0]}
                                        </Avatar>
                                    }
                                        title={user.name}
                                        subheader='Group Admin'
                                />
                            </Card>
                        </>
                        : 
                        <>  
                            <Card className={classes.card}>
                                <CardHeader
                                    avatar={
                                        <Avatar className={classes.avatar}>
                                            {user.name[0]}
                                        </Avatar>
                                    }
                                        title={user.name}
                                        subheader='Member'
                                />
                            </Card>
                        </>
                        }
                    </GridListTile>
                    ))) : (
                        <Typography>You're not part of any groups!</Typography>
                    )};
                </GridList> 
            </div>
            <div>
                <Typography variant="h6">Comments</Typography>
            </div>
            {group.Users.find(({id})=> id === user.sub) ?
            <Typography>
                <form onSubmit={_handleAddComment} noValidate autoComplete="off">
                    <TextField 
                        id="filled-multiline-static"
                        className={classes.textField}
                        multiline
                        rows={4}
                        defaultValue="Default Value"
                        variant="filled" 
                        onChange={(event) => _handleComment(event.target.value)}
                        value={newComment}
                        // style={{color: '#fff'}}
                    />
                    <br />
                    <br />
                    <Button type="submit" color="secondary" variant="contained" size="large">Add Comment</Button>
                </form>
                <br />
            </Typography>
            :
            <>
                <br /><Typography>
                Join this group to be able to comment. </Typography>
                <br />
                </>}
            <div className={classes.groupsDiv}> 
                <GridList  className={lWidth > 575 ? classes.gridList : classes.commentsMobile} cols={lWidth > 575 ? 2 : 1} cellHeight={'auto'} >
                {(comments.length !== 0) ? (
                    comments.map((comment) => {
                        return (
                            <div>
                                <GridListTile cellHeight={'auto'}>
                                <br />
                                <Card className={classes.card} >
                                    <CardHeader
                                        avatar={
                                        <Avatar className={classes.avatar}>
                                            {comment.Users[0].name[0]}
                                        </Avatar>
                                        }
                                        title={comment.Users[0].name}
                                        subheader={moment(comment.createdAt).format('MMMM Do YYYY, h:mm a')}
                                    />
                                    <CardContent>
                                        {comment.Books.length !==0 ? 
                                        (
                                            <>
                                            <Link to={`${comment.Books[0].editionKey}`}><Typography variant="h4" color="secondary">{comment.Books[0].title}</Typography></Link>
                                            <Typography style={{color: '#002B36'}}>{comment.content}</Typography>
                                            </>
                                        ) :
                                        <Typography style={{color: '#002B36'}}>{comment.content}</Typography> }
                                    </CardContent>
                                </Card>
                                <br />
                                </GridListTile>
                            </div>
                        )
                    })
                ) : (
                    <Typography>This group has no comments yet! Why don't you add one?</Typography>
                )}
                </GridList>
                
            </div>
        </Container>
    )
}

export default GroupPage;