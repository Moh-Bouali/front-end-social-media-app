import { Card, CardContent, Typography } from "@mui/material";

function PostCard() {
  return (
    <Card sx={{ marginBottom: 2 }}>
      <CardContent>
        <Typography variant="h6" component="div">
          Jakub {/* Display the username */}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {new Date().toLocaleDateString()} {/* Post date */}
        </Typography>
        <Typography variant="body1" sx={{ marginTop: 1 }}>
          I am a picka! {/* Display the post content */}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default PostCard;
