import URL from "../constants/APIConstants";

const posts = "/api/post";

// For future refactoring, to centralize all methods
const getPostsOfFriends = (id, token, page, size) => {
  return URL.get(`${posts}/getPosts`, {
    headers: {
      Authorization: `Bearer ${token}`, // Attach the JWT token in the Authorization header
      "X-user-Id": id,
    },
    params: {
      page: page,
      size: size,
    },
  });
};

const PostsService = {
  getPostsOfFriends,
};

export default PostsService;
