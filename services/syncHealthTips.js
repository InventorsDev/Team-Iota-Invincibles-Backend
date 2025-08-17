const axios = require("axios");
const striptags = require("striptags");
const he = require("he");
const HealthTip = require("../models/HealthTip");

const clean = (text = "") =>
    striptags(he.decode(text))
        .replace(/[\r\n]+/g, "")
        .trim();

const fetchWHOHealthTips = async () => {
    try {
        const { data } = await axios.get(
            "https://www.who.int/api/news/healthtopics"
        );
        return (data?.value || []).map((topic) => ({
            source: "WHO",
            title: clean(topic.Title),
            summary: clean(topic.Summary),
            details: clean(topic.Tab1Summary),
            category: topic.healthtopics || [],
            url: topic.Url || null,
        }));
    } catch (error) {
        console.error("Error fetching WHO health tips:", error.message);
        return [];
    }
};

const fetchHealthFinder = async () => {
    try {
        const { data } = await axios.get(
            "https://health.gov/myhealthfinder/api/v4/topicsearch.json"
        );

        const topics = data?.Result?.Resources?.Resource || [];

        return topics.map((topic) => {
            // normalize sections into array
            const sections = Array.isArray(topic.Sections?.section)
                ? topic.Sections.section
                : topic.Sections?.section
                ? [topic.Sections.section]
                : [];

            const overview = sections[0]?.Content || "";
            const details = sections
                .map((s) => `${s.Title}: ${s.Content}`)
                .join("\n\n");

            return {
                source: "HealthFinder",
                title: clean(topic.Title),
                summary: clean(overview),
                details: clean(details),
                category: topic.Categories ? [topic.Categories] : [],
                url: topic.AccessibleVersion || null,
            };
        });
    } catch (error) {
        console.error("Error fetching HealthFinder tips:", error.message);
        return [];
    }
};

const syncHealthTips = async () => {
    console.log("Starting health tips sync...");
    const [whoTips, healthFinderTips] = await Promise.all([
        fetchWHOHealthTips(),
        fetchHealthFinder(),
    ]);
    const tips = [...whoTips, ...healthFinderTips];

    for (const tip of tips) {
        await HealthTip.findOneAndUpdate(
            { title: tip.title, source: tip.source },
            { $set: tip },
            { upsert: true, new: true }
        );
    }

    console.log(`Synced ${tips.length} health tips.`);
};

module.exports = syncHealthTips;
