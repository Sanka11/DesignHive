// src/api/followApi.js
import axios from "./axios";

export const sendFollowRequest = (senderEmail, receiverEmail) =>
  axios.post("/follow/send", null, {
    params: { senderEmail, receiverEmail },
  });

export const acceptFollowRequest = (requestId) =>
  axios.post("/follow/accept", null, { params: { requestId } });

export const getPendingRequests = (receiverEmail) =>
  axios.get("/follow/pending", { params: { receiverEmail } });

export const getFollowers = (email) =>
  axios.get("/follow/followers", { params: { email } });

export const getFollowing = (email) =>
  axios.get("/follow/following", { params: { email } });
