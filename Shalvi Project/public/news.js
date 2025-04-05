document.addEventListener("DOMContentLoaded", () => {
    const newsContainer = document.getElementById("news-container");
    const homePageHeading = document.querySelector(".homePageHeading");
    const breakingNewsTicker = document.getElementById("breaking-news-ticker"); // For breaking news banner

    let allNews = []; // Store all fetched news
    let displayedNewsCount = 0; // Track how many news cards are shown
    const batchSize = 8; // Number of news articles per batch

    // Create a loader and add it before fetching news
    const loader = document.createElement("div");
    loader.classList.add("loader");
    newsContainer.appendChild(loader);

    fetch("http://localhost:5500/news") // Fetch news from backend
        .then(response => response.json())
        .then(data => {
            loader.remove(); // Remove loader after fetching

            allNews = data.filter(article => article.description && article.description.trim() !== ""); // Remove empty descriptions
            displayNextBatch(); // Show first batch of news

            // ✅ Breaking News: Show top 5 headlines in ticker
            const topHeadlines = allNews.slice(0, 5).map(article => article.title).join(" || ");
            breakingNewsTicker.innerHTML = topHeadlines;
        })
        .catch(error => {
            console.error("Error fetching news:", error);
            newsContainer.innerHTML = "Failed to load news. Try again later.";
            homePageHeading.innerHTML = "SORRY!";
        });

    // Function to display the next batch of news
    function displayNextBatch() {
        const nextBatch = allNews.slice(displayedNewsCount, displayedNewsCount + batchSize);
        nextBatch.forEach(article => {
            const { title, description, link } = article;
            const newsCard = document.createElement("div");
            newsCard.classList.add("news-card");
            // Convert pubDate string into a proper Date object
            const rawDate = article.pubDate;
            const pubDate = rawDate ? new Date(Date.parse(rawDate)).toLocaleString("en-US", {
                weekday: "short",
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }) : "Unknown Date"; // Fallback if date is missing
            newsCard.innerHTML = `
            <h2 style="margin-bottom: 20px;">${title}</h2>
            <p>${description}</p>
            <a href="${link}" target="_blank">Read More</a>
            `;
            newsContainer.appendChild(newsCard);
        });

        displayedNewsCount += batchSize;
    }

    // Detect when the user scrolls to the bottom & load more news
    window.addEventListener("scroll", () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
            displayNextBatch();
        }
    });
});

function toggleMenu() {
    let menu = document.getElementById("nav-menu");
    menu.style.display = menu.style.display === "block" ? "none" : "block";
}