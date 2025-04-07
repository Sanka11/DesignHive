package com.designhive.controller;

import com.designhive.entity.FollowRequest;
import com.designhive.repository.FollowRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/follow")
public class FollowController {

    @Autowired
    private FollowRepository followRepository;

    @PostMapping("/send")
    public String sendRequest(@RequestParam String senderEmail, @RequestParam String receiverEmail) throws Exception {
        followRepository.sendFollowRequest(senderEmail, receiverEmail);
        return "Follow request sent";
    }

    @PostMapping("/accept")
    public String acceptRequest(@RequestParam String requestId) throws Exception {
        followRepository.acceptFollowRequest(requestId);
        return "Follow request accepted";
    }

    @GetMapping("/pending")
    public List<FollowRequest> getPending(@RequestParam String receiverEmail) throws Exception {
        return followRepository.getPendingRequests(receiverEmail);
    }

    @GetMapping("/followers")
    public List<FollowRequest> getFollowers(@RequestParam String email) throws Exception {
        return followRepository.getFollowers(email);
    }

    @GetMapping("/following")
    public List<FollowRequest> getFollowing(@RequestParam String email) throws Exception {
        return followRepository.getFollowing(email);
    }

    @GetMapping("/statuses")
    public Map<String, String> getFollowStatuses(@RequestParam String senderEmail) throws Exception {
        return followRepository.getFollowStatuses(senderEmail);
    }

    @PostMapping("/unfollow")
    public String unfollow(@RequestParam String senderEmail, @RequestParam String receiverEmail) throws Exception {
        followRepository.unfollow(senderEmail, receiverEmail);
        return "Unfollowed successfully";
    }

}
