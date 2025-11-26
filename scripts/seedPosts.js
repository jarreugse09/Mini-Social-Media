require("dotenv").config();
const mongoose = require("mongoose");
const Post = require("../src/models/postModel");
const User = require("../src/models/userModel");

function normalizeConnectionString(cs) {
  if (!cs || typeof cs !== "string") return cs;
  if (cs.startsWith("mongodb+srv://")) {
    const idx = cs.indexOf("/", cs.indexOf("@"));
    if (idx === -1) {
      if (cs.includes("?")) return cs.replace("?", "/mini-social?");
      return cs + "/mini-social";
    }
    const pathPart = cs.slice(idx);
    if (pathPart === "/" || pathPart.startsWith("/?")) {
      if (pathPart.startsWith("/?")) return cs.replace("/?", "/mini-social?");
      return cs.replace("/", "/mini-social");
    }
  }
  return cs;
}

const rawConnection =
  process.env.CONNECTION_STRING || "mongodb://localhost:27017/mini-social";
const connectionString = normalizeConnectionString(rawConnection);

const usersData = [
  "JomsDev",
  "Alice",
  "Bob",
  "Charlie",
  "Dave",
  "Eve",
  "Frank",
  "Grace",
  "Hannah",
  "Ian",
  "Jack",
  "Karen",
  "Leo",
  "Mia",
  "Nina",
  "Oscar",
  "Paul",
  "Quinn",
  "Rachel",
  "Steve",
];
const topics = [
  {
    title: "Best Moments in Demon Slayer Season 4",
    category: "anime",
    image:
      "https://media.newindianexpress.com/newindianexpress%2F2025-09-16%2Fkxtmnte9%2Ftanjiro-demon.jpg?w=480&auto=format%2Ccompress&fit=max",
  },
  {
    title: "Why Anime Hits Different at Night",
    category: "anime",
    image:
      "https://www.shutterstock.com/image-vector/boy-look-towards-sky-hill-600nw-2495590565.jpg",
  },
  {
    title: "Top 25 Anime Characters of All Time (My Picks)",
    category: "anime",
    image:
      "https://assets-prd.ignimgs.com/2022/08/17/top25animecharacters-blogroll-1660777571580.jpg",
  },
  {
    title: "My Manga Sketch Inspirations",
    category: "anime",
    image: "https://tokyo.nl/wp-content/uploads/2014/10/manga-tekeningen.jpg",
  },
  {
    title: "Anime Characters That Changed My Life",
    category: "anime",
    image: "https://images7.alphacoders.com/986/thumb-1920-986484.png",
  },

  {
    title: "Oppenheimer: A Masterpiece or Overrated?",
    category: "movies",
    image:
      "https://creativereview.imgix.net/uploads/2023/12/Oppenheimer.jpg?auto=compress,format&crop=faces,entropy,edges&fit=crop&q=60&w=1263&h=2000",
  },
  {
    title: "The Evolution of Modern Movie Posters",
    category: "movies",
    image:
      "https://preview.redd.it/what-has-happened-to-movie-posters-v0-tm2y16wnnhb81.jpg?width=640&crop=smart&auto=webp&s=2f1305986475f9787ba4dd2ca1486abdb206a377",
  },
  {
    title: "Why Moonlight Still Hits Emotionally",
    category: "movies",
    image: "https://posterhouse.org/wp-content/uploads/2021/05/moonlight_0.jpg",
  },
  {
    title: "Star Wars Rogue One: The Most Underrated Star Wars Movie",
    category: "movies",
    image:
      "https://i5.walmartimages.com/seo/Star-Wars-Rogue-One-Movie-Poster-Print-Regular-Style-One-Sheet-Design_deaf2e49-0946-4bae-996a-befc2d602ba1.13a380cc3fd906e3d918e67b593e138a.jpeg",
  },
  {
    title: "Top Upcoming Films I'm Excited For",
    category: "movies",
    image:
      "https://assets.mubicdn.net/images/notebook/post_images/38230/images-w1400.jpeg?1701779649",
  },

  {
    title: "My Roadmap to Becoming a Full-Stack Developer",
    category: "programming",
    image:
      "https://builtin.com/sites/www.builtin.com/files/2024-09/programming-languages.jpg",
  },
  {
    title: "Python Tips I Wish I Knew Earlier",
    category: "programming",
    image:
      "https://onlinedegrees.sandiego.edu/wp-content/uploads/2023/05/6-careers-you-can-get-with-python.jpg",
  },
  {
    title: "How I Set Up My Coding Environment",
    category: "programming",
    image:
      "https://geospatialtraining.com/wp-content/uploads/2016/12/Setting-up-a-Python-working-environment.jpeg",
  },
  {
    title: "Why Learning JavaScript Changes Everything",
    category: "programming",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTQCSlNFRQdK3gWnwPGJsXa-wCIpV31axVJ6w&s",
  },
  {
    title: "My Favorite Programming Quotes",
    category: "programming",
    image:
      "https://extension.harvard.edu/wp-content/uploads/sites/8/2020/10/computer-programming.jpg",
  },

  {
    title: "Taking a Walk to Clear My Mind",
    category: "life",
    image:
      "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bWVhbmluZyUyMG9mJTIwbGlmZXxlbnwwfHwwfHx8MA%3D%3D",
  },
  {
    title: "What Happiness Means to Me Lately",
    category: "life",
    image:
      "https://www.techexplorist.com/wp-content/uploads/2019/12/happiness.jpg",
  },
  {
    title: "Life Lately: Just Trying to Stay Positive",
    category: "life",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPkAmHnrq8rzRqqDBZV6TKTS9qRRF6vjQ_qnqsPE6X7fjWD3a4JDmJow-B54pY-8Y6zwo&usqp=CAU",
  },
  {
    title: "Small Wins Matter",
    category: "life",
    image:
      "https://transcode-v2.app.engoo.com/image/fetch/f_auto,c_lfill,w_300,dpr_3/https://assets.app.engoo.com/organizations/5d2656f1-9162-461d-88c7-b2505623d8cb/images/03b3I3rhrRQfcs1mXFc4WU.jpeg",
  },
  {
    title: "Morning Hikes Are Healing",
    category: "life",
    image:
      "https://a.storyblok.com/f/295180/2160x1080/8c588008d3/post_image-summer-hike.jpg",
  },
  {
    title: "Concert Night: My Voice Is Gone",
    category: "life",
    image:
      "https://billboardphilippines.com/wp-content/uploads/2025/06/sb19-ph-arena-ftr-img-1600x838.jpg",
  },
  {
    title: "SB19 Still Hits Different Live",
    category: "life",
    image:
      "https://images.gmanews.tv/webpics/2023/09/Sb19_2023_09_18_15_25_50.jpg",
  },
  {
    title: "Another Day, Another Grind",
    category: "life",
    image:
      "https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?cs=srgb&dl=pexels-wendywei-1190298.jpg&fm=jpg",
  },

  { title: "Late-night thoughts hit harder", category: "life", image: null },
  {
    title: "This week feels productive somehow",
    category: "life",
    image: null,
  },
  {
    title: "Trying out new workflows for coding",
    category: "programming",
    image: null,
  },
  {
    title: "Watching old movies again feels nostalgic",
    category: "movies",
    image: null,
  },
  { title: "Anime Sundays = best Sundays", category: "anime", image: null },
  {
    title: "Learning new things little by little",
    category: "life",
    image: null,
  },
  { title: "Playing games again after months", category: "games", image: null },
  { title: "Coffee + Rain = Best Mood", category: "life", image: null },
];

const commentOptions = [
  "solid",
  "nice post",
  "true",
  "agree ako",
  "same here",
  "noted",
  "legit",
  "good point",
  "fr",
  "same thoughts",
  "lol",
  "interesting",
  "been there",
  "respect",
  "clean take",
];

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

async function seed() {
  try {
    // Connect to MongoDB
    await mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    await User.deleteMany({});
    await Post.deleteMany({});

  const createdUsers = await User.insertMany(
    usersData.map((u) => ({
      username: u,
      email: `${u}@gmail.com`,
      password: "password123",
      role: "user",
    }))
  );

  const userMap = {};
  createdUsers.forEach((u) => (userMap[u.username] = u._id));

  const posts = [];

  for (let i = 0; i < 100; i++) {
    const topic = rand(topics);
    const owner = rand(usersData);

    const commentCount = Math.floor(Math.random() * 5);
    const comments = [];

    for (let j = 0; j < commentCount; j++) {
      const commenter = rand(usersData);
      comments.push({
        username: commenter,
        user: userMap[commenter],
        text: rand(commentOptions),
      });
    }

    posts.push({
      title: topic.title,
      description: topic.title,
      username: owner,
      user: userMap[owner],
      likes: Math.floor(Math.random() * 200),
      dislikes: Math.floor(Math.random() * 20),
      comments,
      category: topic.category,
      image: topic.image,
    });
  }

  await Post.insertMany(posts);
    console.log("seed done");
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
}

seed();
