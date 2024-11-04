// import { useEffect, useState, useRef } from "react";
// import { useAuth } from "../contexts/AuthContext"; // Import AuthContext to access the token
// import PrimarySearchAppBar from "../components/AppNav";
// import PostCard from "../components/PostsCard"; // Import PostCard component
// import { Container, Typography, Grid } from "@mui/material";
// import PostsService from "../CRUDS/PostsCRUD";
// import InfiniteScroll from "react-infinite-scroll-component";

// const MainPage = () => {
//   const { token, logout } = useAuth(); // Access the JWT token from context
//   const [profile, setProfile] = useState(null); // Set initial state to null
//   const [loading, setLoading] = useState(true); // Add loading state
//   const [posts, setPosts] = useState([]); // State to store posts of friends
//   const [page, setPage] = useState(0); // Current page number
//   const size = 20; // Define the number of posts per page
//   const [hasMore, setHasMore] = useState(true);
//   const [isFetching, setIsFetching] = useState(false);
//   const hasMoreRef = useRef(hasMore);
//   const isFetchingRef = useRef(isFetching);
//   // Fetch the user's existing profile when the component loads
//   useEffect(() => {
//     if (token) {
//       fetch("http://localhost:9000/api/user/profile", {
//         method: "GET",
//         headers: {
//           Authorization: `Bearer ${token}`, // Attach the JWT token in the Authorization header
//         },
//       })
//         .then((response) => {
//           if (!response.ok) {
//             throw new Error("Network response was not ok");
//           }
//           return response.json();
//         })
//         .then((data) => {
//           console.log(data);
//           setProfile(data); // Update state with the fetched profile data
//         })
//         .catch((error) => {
//           console.error("Error fetching profile:", error);
//         })
//         .finally(() => {
//           setLoading(false); // Set loading to false after fetching
//         });
//     }
//   }, [token]);

//   useEffect(() => {
//     const fetchPosts = async () => {
//       if (token && profile && hasMore) {
//         try {
//           setIsFetching(true); // Set a flag to indicate fetching has started

//           const response = await PostsService.getPostsOfFriends(
//             profile.id,
//             token,
//             page,
//             size
//           );

//           console.log("Fetched posts response:", response.data);

//           if (
//             response.data &&
//             response.data._embedded &&
//             response.data._embedded.postResponseList
//           ) {
//             console.log("inside if statement after getting posts");
//             setPosts((prevPosts) => [
//               ...prevPosts,
//               ...response.data._embedded.postResponseList,
//             ]);

//             const totalPages = response.data.page.totalPages;
//             console.log("Total pages:", totalPages);

//             // Update hasMore based on totalPages
//             if (page + 1 >= totalPages) {
//               setHasMore(false);
//             }

//             console.log("Has more:", hasMore);
//           } else {
//             setHasMore(false);
//             console.error("Unexpected response structure", response);
//           }
//         } catch (error) {
//           console.error("Error fetching posts:", error);
//         } finally {
//           setIsFetching(false); // Fetching is done
//         }
//       }
//     };

//     if (!isFetching && hasMore) {
//       fetchPosts();
//     }
//   }, [token, profile, page, hasMore, isFetching]); // Removed 'hasMore' from dependencies

//   useEffect(() => {
//     const handleScroll = () => {
//       if (
//         hasMoreRef.current &&
//         !isFetchingRef.current &&
//         window.innerHeight + window.scrollY >=
//           document.documentElement.scrollHeight - 100
//       ) {
//         setPage((prevPage) => prevPage + 1);
//       }
//     };

//     window.addEventListener("scroll", handleScroll);

//     return () => {
//       window.removeEventListener("scroll", handleScroll);
//     };
//   }, []); // Empty dependency array to set up the event listener once

//   const handleLogout = () => {
//     logout();
//   };

//   if (loading) {
//     return <div>Loading profile...</div>; // Show loading state
//   }

//   if (!profile) {
//     return <div>No profile found</div>; // Handle case where no profile is returned
//   }

//   return (
//     <div>
//       <PrimarySearchAppBar token={token} user={profile} />
//       <Container maxWidth="md" sx={{ marginTop: 4 }}>
//         <Typography variant="h4" gutterBottom>
//           Welcome, {profile.username}
//         </Typography>
//         <Typography variant="h5" gutterBottom>
//           Friends Posts
//         </Typography>
//         <Grid container spacing={2}>
//           {posts.length > 0 ? (
//             posts.map((post) => (
//               <Grid item xs={12} key={post.id}>
//                 {post.content.length > 0 ? (
//                   post.content.map((contentItem, index) => (
//                     <PostCard key={index} post={contentItem} />
//                   ))
//                 ) : (
//                   <Typography variant="body1">
//                     No content to display for this post.
//                   </Typography>
//                 )}
//               </Grid>
//             ))
//           ) : (
//             <Typography variant="body1">No posts to display.</Typography>
//           )}
//         </Grid>
//         {!hasMore && (
//           <Typography variant="body1" align="center">
//             No more posts to display.
//           </Typography>
//         )}
//         <button onClick={handleLogout}>Logout</button>
//       </Container>
//     </div>
//   );
// };

// export default MainPage;

// import { useEffect, useState, useCallback } from "react";
// import { useAuth } from "../contexts/AuthContext";
// import PrimarySearchAppBar from "../components/AppNav";
// import PostCard from "../components/PostsCard";
// import { Container, Typography, Grid } from "@mui/material";
// import PostsService from "../CRUDS/PostsCRUD";
// import debounce from "lodash/debounce";

// const MainPage = () => {
//   const { token, logout } = useAuth();
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [posts, setPosts] = useState([]);
//   const [page, setPage] = useState(0);
//   const size = 20;
//   const [hasMore, setHasMore] = useState(true);
//   const [isFetching, setIsFetching] = useState(false);

//   useEffect(() => {
//     if (token) {
//       fetch("http://localhost:9000/api/user/profile", {
//         method: "GET",
//         headers: { Authorization: `Bearer ${token}` },
//       })
//         .then((response) => response.json())
//         .then((data) => setProfile(data))
//         .finally(() => setLoading(false));
//     }
//   }, [token]);

//   useEffect(() => {
//     const fetchPosts = async () => {
//       if (!token || !profile || !hasMore || isFetching) return;

//       setIsFetching(true);
//       try {
//         console.log(
//           "Fetching posts with page:",
//           page,
//           "size:",
//           size,
//           "profileId:",
//           profile.id
//         );

//         const response = await PostsService.getPostsOfFriends(
//           profile.id,
//           token,
//           page,
//           size
//         );

//         if (
//           response.data &&
//           response.data._embedded &&
//           response.data._embedded.postResponseList
//         ) {
//           setPosts((prevPosts) => [
//             ...prevPosts,
//             ...response.data._embedded.postResponseList,
//           ]);

//           const totalPages = response.data.page.totalPages;
//           setHasMore(page + 1 < totalPages);
//           setIsFetching(false);
//           console.log(hasMore);
//           console.log("Is fetching is " + isFetching);
//         } else {
//           setHasMore(false);
//         }
//       } catch (error) {
//         console.error("Error fetching posts:", error);
//       } finally {
//         console.log("setting is fetching to false");
//         setIsFetching(false);
//         console.log(isFetching);
//       }
//     };

//     if (page >= 0) {
//       console.log("going to run fetch posts");
//       // Make sure this runs whenever page increments
//       fetchPosts();
//     }
//   }, [page, token, profile]);

//   // Scroll handler with debounce
//   const handleScroll = useCallback(
//     debounce(() => {
//       // if (
//       //   hasMore &&
//       //   !isFetching &&
//       //   window.innerHeight + window.scrollY >=
//       //     document.documentElement.scrollHeight - 100
//       // ) {
//       console.log("Page incremented to:", page + 1);
//       setPage((prevPage) => prevPage + 1);
//       //}
//     }, 300),
//     [hasMore, isFetching, page]
//   );

//   useEffect(() => {
//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, [handleScroll]);

//   const handleLogout = () => {
//     logout();
//   };

//   if (loading) return <div>Loading profile...</div>;
//   if (!profile) return <div>No profile found</div>;

//   return (
//     <div>
//       <PrimarySearchAppBar token={token} user={profile} />
//       <Container maxWidth="md" sx={{ marginTop: 4 }}>
//         <Typography variant="h4" gutterBottom>
//           Welcome, {profile.username}
//         </Typography>
//         <Typography variant="h5" gutterBottom>
//           Friends Posts
//         </Typography>
//         <Grid container spacing={2}>
//           {posts.length > 0 ? (
//             posts.map((post, index) => (
//               <Grid item xs={12} key={post.id || index}>
//                 {post.content.length > 0 ? (
//                   post.content.map((contentItem, idx) => (
//                     <PostCard key={idx} post={contentItem} />
//                   ))
//                 ) : (
//                   <Typography variant="body1">
//                     No content to display for this post.
//                   </Typography>
//                 )}
//               </Grid>
//             ))
//           ) : (
//             <Typography variant="body1">No posts to display.</Typography>
//           )}
//         </Grid>
//         {!hasMore && (
//           <Typography variant="body1" align="center">
//             No more posts to display.
//           </Typography>
//         )}
//         <button onClick={handleLogout}>Logout</button>
//       </Container>
//     </div>
//   );
// };

// export default MainPage;

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
      fetch("http://localhost:9000/api/user/profile", {
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
