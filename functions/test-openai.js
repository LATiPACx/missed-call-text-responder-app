const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
    apiKey: "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",
});

const openai = new OpenAIApi(configuration);

(async () => {
    try {
        const response = await openai.createChatCompletion({
            model: "gpt-4",
            messages: [{ role: "user", content: "Say hello" }],
            max_tokens: 10,
        });
        console.log("AI Response:", response.data.choices[0].message.content);
    } catch (error) {
        console.error("Error:", error.message);
    }
})();
