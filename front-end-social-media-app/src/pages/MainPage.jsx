// MainPage.jsx
import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import PrimarySearchAppBar from "../components/AppNav";
import PostCard from "../components/PostsCard"; // Adjusted import to match component name
import { Container, Typography, Grid } from "@mui/material";
import PostsService from "../CRUDS/PostsCRUD";
import debounce from "lodash/debounce";

const MainPage = () => {
  const { token, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(0);
  const size = 20;
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  // Refs to keep track of latest hasMore and isFetching values
  const hasMoreRef = useRef(hasMore);
  const isFetchingRef = useRef(isFetching);

  useEffect(() => {
    hasMoreRef.current = hasMore;
    isFetchingRef.current = isFetching;
  }, [hasMore, isFetching]);

  // Fetch user profile
  useEffect(() => {
    if (token) {
      fetch("http://gateway-domain/api/user/profile", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((response) => response.json())
        .then((data) => setProfile(data))
        .catch((error) => {
          console.error("Error fetching profile:", error);
          setProfile(null);
        })
        .finally(() => setLoading(false));
    }
  }, [token]);

  // Fetch posts whenever page changes
  useEffect(() => {
    const fetchPosts = async () => {
      if (!token || !profile || !hasMoreRef.current || isFetchingRef.current)
        return;

      setIsFetching(true);
      try {
        console.log(
          "Fetching posts with page:",
          page,
          "size:",
          size,
          "profileId:",
          profile.id
        );

        const response = await PostsService.getPostsOfFriends(
          profile.id,
          token,
          page,
          size
        );

        // Update the key based on API response
        const embeddedPostsKey = response.data._embedded
          ? Object.keys(response.data._embedded)[0]
          : null;

        if (
          response.data &&
          response.data._embedded &&
          response.data._embedded[embeddedPostsKey]
        ) {
          const postsData = response.data._embedded[embeddedPostsKey];

          setPosts((prevPosts) => [...prevPosts, ...postsData]);

          const totalPages = response.data.page.totalPages;
          const newHasMore = page + 1 < totalPages;
          setHasMore(newHasMore);
          console.log("Has more:", newHasMore);
        } else {
          setHasMore(false);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setIsFetching(false);
      }
    };

    if (page >= 0) {
      console.log("Going to run fetchPosts");
      fetchPosts();
    }
  }, [page, token, profile]);

  // Scroll handler with debounce
  const handleScroll = useCallback(
    debounce(() => {
      if (
        hasMoreRef.current &&
        !isFetchingRef.current &&
        window.innerHeight + window.scrollY >=
          document.documentElement.scrollHeight - 100
      ) {
        console.log("Page incremented to:", page + 1);
        setPage((prevPage) => prevPage + 1);
      }
    }, 300),
    [] // Empty dependency array ensures this function is only created once
  );

  // Add scroll event listener once
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const handleLogout = () => {
    logout();
  };

  if (loading) return <div>Loading profile...</div>;
  if (!profile) return <div>No profile found</div>;

  return (
    <div>
      <PrimarySearchAppBar token={token} user={profile} />
      <Container maxWidth="md" sx={{ marginTop: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome, {profile.username}
        </Typography>
        <Typography variant="h5" gutterBottom>
          Friends' Posts
        </Typography>
        <Grid container spacing={2}>
          {posts.length > 0 ? (
            posts.map((post, index) => (
              <Grid item xs={12} key={post.id || index}>
                <PostCard post={post} />
              </Grid>
            ))
          ) : (
            <Typography variant="body1">No posts to display.</Typography>
          )}
        </Grid>
        {isFetching && (
          <Typography variant="body1" align="center">
            Loading more posts...
          </Typography>
        )}
        {!hasMore && !isFetching && (
          <Typography variant="body1" align="center">
            No more posts to display.
          </Typography>
        )}
        <button onClick={handleLogout}>Logout</button>
      </Container>
    </div>
  );
};

export default MainPage;
