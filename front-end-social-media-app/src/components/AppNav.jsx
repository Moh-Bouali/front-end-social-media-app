import { useState, useEffect, useRef } from "react";
import { styled, alpha } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import InputBase from "@mui/material/InputBase";
import Badge from "@mui/material/Badge";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import AccountCircle from "@mui/icons-material/AccountCircle";
import MailIcon from "@mui/icons-material/Mail";
import NotificationsIcon from "@mui/icons-material/Notifications";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import MoreIcon from "@mui/icons-material/MoreVert";
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton as MuiIconButton,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import { useAuth } from "../contexts/AuthContext";
import { Cookies } from "react-cookie";

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
    width: "auto",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "20ch",
    },
  },
}));

function PrimarySearchAppBar({ user }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null);
  const [message, setMessage] = useState("");
  const [nmbrOfNotifications, setNmbrOfNotifications] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [connected, setConnected] = useState(false); // Keep track of connection status
  const { token } = useAuth(); // Access the JWT token from context
  const [currentRequest, setCurrentRequest] = useState(null);
  const [currentResponse, setCurrentResponse] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [isInRequest, setIsInRequest] = useState(true);
  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);
  const clientRef = useRef(null); // Store reference to Stomp client
  const connectedRef = useRef(false); // Store connection state to avoid repeated connections
  const [isFriend, setIsFriend] = useState(false);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleSearchChange = async (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value) {
      try {
        // Make an API call to search for users by username or email
        const response = await fetch(
          `http://api-gateway:9000/api/user/search?query=${e.target.value}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`, // Use the token for authentication
            },
          }
        );

        if (response.ok) {
          const users = await response.json();

          // Check the friendship status for each user
          const updatedUsers = await Promise.all(
            users.map(async (searchedUser) => {
              const friendshipResponse = await fetch(
                `http://api-gateway:9000/api/friendship/check`,
                {
                  method: "GET",
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "X-user-Id": user.id,
                    "X-Friend-Id": searchedUser.id, // Use the token for authentication
                  },
                }
              );

              // Store the friendship status in a variable
              //setIsFriend(await friendshipResponse.json());
              const isFriend = await friendshipResponse.json();
              console.log("checking response", isFriend);
              //setIsFriend(isUserAFriend);

              // Return the user object with additional friendship status
              return { ...searchedUser, isFriend };
            })
          );

          setSearchResults(updatedUsers);
        }
      } catch (error) {
        console.error("Error searching for users:", error);
        setSearchResults([]); // Clear results on error
      }
    } else {
      setSearchResults([]); // Clear the search results when the input is cleared
    }
  };

  useEffect(() => {
    if (connectedRef.current) {
      return; // Prevent reconnection if already connected
    }

    // Set up WebSocket and Stomp client
    const socket = new WebSocket(
      `ws://api-gateway:9000/ws?access_token=${token}`
    );
    const client = Stomp.over(socket);

    client.connect({ Authorization: `Bearer ${token}` }, () => {
      console.log("connected!");

      // Subscribe to friend requests for the requested user
      client.subscribe(`/topic/requests/${user.id}`, (message) => {
        const request = JSON.parse(message.body);
        setNotifications((prevNotifications) => [
          ...prevNotifications,
          request,
        ]);
        setCurrentRequest(request); // Set the current friend request
        setNmbrOfNotifications((prevCount) => prevCount + 1);
        setIsInRequest(true); // This indicates it's a friend request
      });

      // Subscribe to friend request responses for the requester
      client.subscribe(`/topic/responses/${user.id}`, (message) => {
        const response = JSON.parse(message.body);
        setNotifications((prevNotifications) => [
          ...prevNotifications,
          response,
        ]);
        setCurrentResponse(response); // Set the current response notification
        setNmbrOfNotifications((prevCount) => prevCount + 1);
        setIsInRequest(false); // This indicates it's a friend response
      });

      connectedRef.current = true; // Mark as connected
      clientRef.current = client; // Save client reference for potential future use
      setConnected(true); // Update state if needed
    });

    // Cleanup function
    return () => {
      // Disconnect only if the component is unmounted
      if (clientRef.current && clientRef.current.connected) {
        console.log("Disconnecting WebSocket");
        clientRef.current.disconnect();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array to run only once after mounting

  const handleAccept = () => {
    //setNmbrOfNotifications((prevCount) => prevCount - 1);
    setIsInRequest(false);

    fetch("http://api-gateway:9000/api/friendship/response", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Use the token for authentication if needed
      },
      body: JSON.stringify({
        ...currentRequest,
        status: "ACCEPTED",
        created_at: new Date().toISOString(),
      }), // Replace with actual requesterId
    })
      .then((response) => response.json())
      .then((data) => {
        setMessage(data);
      })
      .catch((error) => {
        console.error("Error sending friend request:", error);
        setMessage("Failed to send friend request.");
      });
  };

  // Function to send a friend request
  const handleSendFriendRequest = (searchedUser) => {
    fetch("http://api-gateway:9000/api/friendship/request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Use the token for authentication if needed
      },
      body: JSON.stringify({
        requester_id: user.id,
        requester_username: user.username,
        requested_id: searchedUser.id,
        requested_username: searchedUser.username,
        status: "PENDING",
        created_at: new Date().toISOString(),
      }), // Replace with actual requesterId
    })
      .then((response) => response.json())
      .then((data) => {
        setMessage(data);
      })
      .catch((error) => {
        console.error("Error sending friend request:", error);
        setMessage("Failed to send friend request.");
      });
  };

  const renderSearchResults = () => {
    if (searchResults.length > 0) {
      return (
        <List>
          {searchResults
            .filter((searchedUser) => searchedUser.username !== user.username)
            .map((searchedUser) => (
              <ListItem key={searchedUser.id}>
                <ListItemText
                  primary={searchedUser.username}
                  secondary={searchedUser.email}
                />
                <ListItemSecondaryAction>
                  {searchedUser.isFriend ? (
                    // Display check icon if already friends
                    <MuiIconButton edge="end" disabled>
                      <CheckCircleIcon style={{ color: "white" }} />
                    </MuiIconButton>
                  ) : (
                    // Display add friend icon if not friends yet
                    <MuiIconButton
                      edge="end"
                      sx={{ color: "#E3E3E3" }}
                      onClick={() => handleSendFriendRequest(searchedUser)}
                    >
                      <PersonAddIcon />
                    </MuiIconButton>
                  )}
                </ListItemSecondaryAction>
              </ListItem>
            ))}
        </List>
      );
    }
    return null;
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
    setNmbrOfNotifications((prevCount) => prevCount - 1);
  };

  return (
    <Box sx={{ flexGrow: 1, width: "100vw", margin: 0, padding: 0 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ display: { xs: "none", sm: "block" } }}
          >
            ConnectAmigo
          </Typography>
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search friends…"
              inputProps={{ "aria-label": "search" }}
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </Search>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: { xs: "none", md: "flex" } }}>
            {/* <IconButton
              size="large"
              aria-label="show 4 new mails"
              color="inherit"
            >
              <Badge badgeContent={4} color="error">
                <MailIcon />
              </Badge>
            </IconButton> */}
            <>
              <IconButton
                size="large"
                aria-label="show number of new notifications"
                color="inherit"
                onClick={() => {
                  if (nmbrOfNotifications > 0) {
                    handleOpenDialog();
                  }
                }}
              >
                <Badge badgeContent={nmbrOfNotifications} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>

              <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>
                  {isInRequest ? "Friend Request" : "Friend Request Accepted"}
                </DialogTitle>
                <DialogContent>
                  {
                    isInRequest ? (
                      <Typography>
                        You have a friend request from{" "}
                        {currentRequest?.requester_username}.
                      </Typography>
                    ) : // Only display the "Friend Request Accepted" message if the current user is the requester
                    currentResponse?.requester_id === user.id ? (
                      <Typography>
                        {currentResponse?.requested_username} has accepted your
                        friend request!
                      </Typography>
                    ) : null // Don't show any message if it's the requested user
                  }
                </DialogContent>
                <DialogActions>
                  {isInRequest ? (
                    <>
                      <Button onClick={handleAccept}>Accept</Button>
                    </>
                  ) : (
                    <Button onClick={() => setOpenDialog(false)}>Close</Button>
                  )}
                </DialogActions>
              </Dialog>
            </>

            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              //aria-controls={menuId}
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
          </Box>
          <Box sx={{ display: { xs: "flex", md: "none" } }}>
            {/* <IconButton
              size="large"
              aria-label="show more"
              aria-controls={mobileMenuId}
              aria-haspopup="true"
              onClick={handleMobileMenuOpen}
              color="inherit"
            >
              <MoreIcon />
            </IconButton> */}
          </Box>
        </Toolbar>
        {renderSearchResults()}
      </AppBar>
      {/* {renderMobileMenu}
      {renderMenu} */}
    </Box>
  );
}

export default PrimarySearchAppBar;
