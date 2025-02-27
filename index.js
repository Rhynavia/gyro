function isMobile() {
  // add code to try and access the motion
  return screen.width < 768;
}

const videos = [
  "assets/videos/video1.mp4",
  "assets/videos/video2.mp4",
  "assets/videos/video3.mp4",
  "assets/videos/video4.mp4",
  "assets/videos/video5.mp4",
  "assets/videos/video6.mp4",
];

const adjustVideoToTime = () => {
  const date = new Date();
  const hours = date.getHours();
  if (hours >= 6 && hours < 10) return videos;
  if (hours >= 10 && hours < 13)
    return videos.slice(1).concat(videos.slice(0, 1));
  if (hours >= 13 && hours < 16)
    return videos.slice(2).concat(videos.slice(0, 2));
  if (hours >= 16 && hours < 18)
    return videos.slice(3).concat(videos.slice(0, 3));
  if (hours >= 18 && hours < 20)
    return videos.slice(4).concat(videos.slice(0, 4));
  if (hours >= 20 || hours < 6)
    return videos.slice(5).concat(videos.slice(0, 5));
};

const populateVideos = () => {
  mobile.innerHTML = adjustVideoToTime()
    .map((video, index) => {
      return `
        <div class="videoContainer">
            <video id="video${index}" muted playsinline>
                <source src="${video}"/>
            </video>
        </div>
      `;
    })
    .join("");

  // Select all video elements that have been added to the DOM
  const videoElements = mobile.querySelectorAll("video");

  // We'll use this set to track videos that are in view.
  const inViewVideos = new Set();

  // Intersection Observer to update our set.
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        if (entry.isIntersecting) {
          inViewVideos.add(video);
        } else {
          inViewVideos.delete(video);
          video.pause();
        }
      });
    },
    { threshold: 0.5 }
  );

  videoElements.forEach((video) => {
    observer.observe(video);
    video.addEventListener("ended", () => {
      const nextVideo = video.nextElementSibling?.querySelector("video");
      if (nextVideo) {
        nextVideo.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  // DeviceMotion listener to control playing/pausing based on movement.
  window.addEventListener("devicemotion", (event) => {
    const acc = event.acceleration || { x: 0, y: 0 };
    const movement = acc.y * acc.y;
    const threshold = 0.15;

    inViewVideos.forEach((video) => {
      if (movement > threshold) {
        video.play();
      } else {
        video.pause();
      }
    });
  });
};

const loading = document.querySelector(".loading");
const desktop = document.querySelector(".desktop");
const mobile = document.querySelector(".mobile");

if (isMobile()) {
  mobile.classList.toggle("hidden");
  loading.classList.toggle("hidden");

  function requestMotionPermission() {
    if (typeof DeviceMotionEvent.requestPermission === "function") {
      DeviceMotionEvent.requestPermission()
        .then((permissionState) => {
          if (permissionState === "granted") {
            console.log("Motion access granted!");
            populateVideos();
          } else {
            console.log("Motion access denied.");
          }
        })
        .catch(console.error);
    } else {
      populateVideos();
      console.log("Motion permissions not required on this browser.");
    }
  }
  document
    .querySelector(".btn")
    .addEventListener("click", requestMotionPermission);
} else {
  desktop.classList.toggle("hidden");
  loading.classList.toggle("hidden");
}
