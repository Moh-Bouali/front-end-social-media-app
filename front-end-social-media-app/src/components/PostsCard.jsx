import { Card, CardContent, Typography } from "@mui/material";

function PostCard({ post, username }) {
  return (
    <Card sx={{ marginBottom: 2 }}>
      <CardContent>
        {/* Display the username */}
        <Typography variant="h6" component="div">
          {post.username}
        </Typography>
        {/* Display the post date */}
        <Typography variant="body2" color="text.secondary">
          {new Date(post.createdAt).toLocaleDateString()} {/* Post date */}
        </Typography>
        <Typography variant="body1" sx={{ marginTop: 1 }}>
          {post.content} {/* Post content */}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default PostCard;
