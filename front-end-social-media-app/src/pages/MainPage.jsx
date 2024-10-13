import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext"; // Import AuthContext to access the token
import PrimarySearchAppBar from "../components/AppNav";
import PostCard from "../components/PostsCard"; // Import PostCard component
import { Container, Typography, Grid } from "@mui/material";
const MainPage = () => {
  const { token, logout } = useAuth(); // Access the JWT token from context
  const [profile, setProfile] = useState(null); // Set initial state to null
  const [loading, setLoading] = useState(true); // Add loading state
  const [posts, setPosts] = useState([]); // State to store posts of friends

  // Fetch the user's existing profile when the component loads
  useEffect(() => {
    if (token) {
      fetch("http://localhost:9000/api/user/profile", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`, // Attach the JWT token in the Authorization header
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          console.log(data);
          setProfile(data); // Update state with the fetched profile data
        })
        .catch((error) => {
          console.error("Error fetching profile:", error);
        })
        .finally(() => {
          setLoading(false); // Set loading to false after fetching
        });
    }
  }, [token]);

  // For now, use static placeholder data for posts
  useEffect(() => {
    // Set static posts data
    const staticPosts = [
      {
        id: 1,
        username: "friend1",
        content: "This is my first post!",
        createdAt: "2024-01-02T12:00:00Z",
      },
      {
        id: 2,
        username: "friend2",
        content: "Just enjoying a great day at the park!",
        createdAt: "2024-01-02T15:30:00Z",
      },
      {
        id: 3,
        username: "friend3",
        content: "Had a wonderful time at the beach!",
        createdAt: "2024-01-03T09:00:00Z",
      },
    ];
    setPosts(staticPosts);
  }, []); // This effect runs only once on mount, so it won't depend on the token

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return <div>Loading profile...</div>; // Show loading state
  }

  if (!profile) {
    return <div>No profile found</div>; // Handle case where no profile is returned
  }

  return (
    <div>
      <PrimarySearchAppBar token={token} user={profile} />
      <Container maxWidth="md" sx={{ marginTop: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome, {profile.username}
        </Typography>
        <Typography variant="h5" gutterBottom>
          Friends Posts
        </Typography>
        <Grid container spacing={2}>
          {posts.length > 0 ? (
            posts.map((post) => (
              <Grid item xs={12} key={post.id}>
                <PostCard post={post} />
              </Grid>
            ))
          ) : (
            <Typography variant="body1">No posts to display.</Typography>
          )}
        </Grid>
        <button onClick={handleLogout}>Logout</button>
      </Container>
    </div>
  );
};

export default MainPage;
