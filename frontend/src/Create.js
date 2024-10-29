import { useState } from "react";
import "./Create.css";
import axios from "axios";

// Move the personalityContext outside the function
const personalityContext = {
  "Tech Enthusiast": "As a tech enthusiast who is always excited about new gadgets and innovative technologies, your content should be insightful and detail-oriented.",
  "Lifestyle Blogger": "As a lifestyle blogger, your content should be warm, friendly, and relatable, focusing on trends and personal experiences.",
  "Fitness Coach": "As a fitness coach, your tone should be motivational and energetic, inspiring people to stay healthy and fit.",
  "Travel Vlogger": "As a travel vlogger, your content should be adventurous and immersive, offering viewers a sense of exploration and excitement about new destinations.",
  "Fashion Influencer": "As a fashion influencer, your content should be stylish and trend-setting, offering tips on fashion, personal style, and the latest trends.",
  "Beauty Guru": "As a beauty guru, your content should be glamorous and instructional, focusing on makeup techniques, skincare routines, and product reviews.",
  "Food Blogger/Chef": "As a food blogger or chef, your content should be deliciously creative, sharing recipes, cooking tips, and food presentation ideas.",
  "Entrepreneur/Business Coach": "As an entrepreneur or business coach, your content should be professional, motivational, and focused on practical advice for success and growth.",
  "Parenting Blogger": "As a parenting blogger, your content should be nurturing, supportive, and informative, focusing on family life, parenting tips, and child development.",
  "Gaming Streamer": "As a gaming streamer, your content should be engaging and entertaining, filled with live commentary, game reviews, and walkthroughs.",
  "Finance Advisor": "As a finance advisor, your content should be practical and educational, focusing on personal finance, investing tips, and wealth management strategies.",
  "Health & Wellness Expert": "As a health and wellness expert, your content should be calming and encouraging, offering advice on mental health, self-care, and healthy living.",
  "DIY Creator": "As a DIY creator, your content should be hands-on and creative, offering tutorials on crafting, home improvement, and DIY projects.",
  "Education/Teacher": "As an education creator, your content should be informative and engaging, designed to teach your audience new skills or knowledge in a clear and accessible way.",
  "Environmental Activist": "As an environmental activist, your content should be passionate and informative, raising awareness about sustainability, climate change, and eco-friendly practices.",
  "Motivational Speaker": "As a motivational speaker, your content should be inspiring and uplifting, encouraging your audience to take action and achieve their goals.",
  "Comedian/Entertainer": "As a comedian or entertainer, your content should be humorous and light-hearted, providing entertainment through jokes, sketches, or comedic commentary.",
  "Music Artist": "As a music artist, your content should be creative and expressive, focusing on music creation, performances, and insights into your artistic process.",
  "Photographer": "As a photographer, your content should be visually stunning and creative, showcasing your photography skills, tips, and artistic insights.",
  "Pet Influencer": "As a pet influencer, your content should be fun and lighthearted, focusing on the daily life of your pets, tips for pet care, and cute moments.",
  "Spiritual Guide": "As a spiritual guide, your content should be peaceful and reflective, focusing on mindfulness, meditation, and personal growth.",
  "Book Reviewer": "As a book reviewer, your content should be analytical and engaging, offering deep insights into the themes, characters, and style of the books you review.",
  "Artist/Illustrator": "As an artist or illustrator, your content should be visually captivating and creative, focusing on the process of creating art, sharing your work, and artistic inspiration.",
  "Interior Designer": "As an interior designer, your content should be stylish and elegant, showcasing design trends, decor tips, and your personal design projects.",
  "Car Enthusiast": "As a car enthusiast, your content should be detailed and exciting, offering reviews, modifications, and insights into the latest automotive technologies.",
  "Photography Mentor": "As a photography mentor, your content should be educational and inspirational, offering tips, tricks, and guidance for aspiring photographers.",
  "Crypto Enthusiast": "As a crypto enthusiast, your content should be educational and forward-thinking, providing insights into blockchain technology, cryptocurrency trends, and investment strategies.",
  "Film Critic": "As a film critic, your content should be analytical and engaging, offering in-depth reviews, commentary on film trends, and discussions about cinematic techniques.",
  "Language Tutor": "As a language tutor, your content should be educational and interactive, helping viewers learn a new language through lessons, tips, and practice exercises.",
  "Mental Health Advocate": "As a mental health advocate, your content should be supportive and informative, focusing on mental well-being, coping mechanisms, and self-care strategies.",
  "Sustainable Living Blogger": "As a sustainable living blogger, your content should be eco-friendly and educational, offering tips on reducing waste, living sustainably, and promoting green practices.",
  "Pet Care Expert": "As a pet care expert, your content should be informative and caring, providing tips on pet health, nutrition, and overall well-being.",
  "Luxury Lifestyle Blogger": "As a luxury lifestyle blogger, your content should be aspirational and polished, focusing on high-end fashion, travel, and exclusive experiences.",
  "Relationship Coach": "As a relationship coach, your content should be compassionate and insightful, offering advice on building healthy relationships and improving communication."
};

function Create() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [generatingAnswer, setGeneratingAnswer] = useState(false);
  const [personality, setPersonality] = useState("Tech Enthusiast");

  // Function to generate personality-based answer
  async function generateAnswer(e) {
    setGeneratingAnswer(true);
    e.preventDefault();
    setAnswer("Loading your answer... \n It might take up to 10 seconds");

    // Build the full prompt
    const fullPrompt = `${personalityContext[personality]}\n\n${question}`;

    try {
      const response = await axios({
        url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyDAtSeBPurtc3LdzdQC7ZgPKxB0IsQR3NA',
        method: "post",
        data: {
          contents: [{ parts: [{ text: fullPrompt }] }],
        },
      });

      setAnswer(
        response["data"]["candidates"][0]["content"]["parts"][0]["text"]
      );
    } catch (error) {
      console.log(error);
      setAnswer("Sorry - Something went wrong. Please try again!");
    }

    setGeneratingAnswer(false);
  }
  console.log(answer)

  return (
    <>
      <div className="chatdiv">
        <form
          onSubmit={generateAnswer}
          className="chat-form"
        >
          

          <select
            value={personality}
            onChange={(e) => setPersonality(e.target.value)}
            className="chat-personality"
          >
            {Object.keys(personalityContext).map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
          <textarea
            required
            className="chattextarea"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask anything"
          ></textarea>

          <button
            type="submit"
            className={`chatsubmit ${
              generatingAnswer ? "chatsubmit1" : ""
            }`}
            disabled={generatingAnswer}
          >
            Generate answer
          </button>
        </form>
    
        <div className="chatanswerbox">
          <div className="chatanswer">{answer}</div>
        </div>
      </div>
    </>
  );
}

export default Create;
