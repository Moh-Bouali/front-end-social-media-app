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
