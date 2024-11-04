// import URL from "../constants/APIConstants";

// const posts = "/api/user";

// const searchForFriends = (query, token) => {
//   return URL.get(`${posts}/getPosts`, {
//     headers: {
//       Authorization: `Bearer ${token}`, // Attach the JWT token in the Authorization header
//       "X-query": query,
//     },
//   });
// };

// const UsersService = {
//   searchForFriends,
// };

// export default UsersService;

// PostCard.jsx
import React from "react";
import { Card, CardContent, Typography } from "@mui/material";

const PostCard = ({ post }) => {
  return (
    <Card sx={{ marginBottom: 2 }}>
      <CardContent>
        <Typography variant="h6">{post.username}</Typography>
        <Typography variant="body2" color="textSecondary">
          {new Date(post.createdAt).toLocaleString()}
        </Typography>
        <Typography variant="body1" sx={{ marginTop: 1 }}>
          {post.content}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default PostCard;
