## AI Research: Generating Muscle Group Exercises Based on User Data

### Overview
The goal is to develop a system that generates personalized workout exercises for specific muscle groups based on user data (e.g., age, fitness level, and goals). Two implementation options using AI models are under consideration.

### Option 1 — Free
- **Model**: [gpt-oss-20b](https://openrouter.ai/openai/gpt-oss-20b:free)
- **Platform**: [OpenRouter](https://openrouter.ai/openai/gpt-oss-20b:free)

**Pros**
- **Free to use**: No direct API costs
- **Good for early-stage work**: Suitable for testing and prototyping

**Cons**
- **Slow response time**: 10-20 seconds average response time
- **Lower scalability**: Struggles with multiple or complex requests
- **Stability issues**: Potentially unstable for long/complex prompts

**Conclusion**
Ideal for initial prototyping and quick experiments, but not recommended for production due to slow responses and inconsistent performance.

### Option 2 — Paid
- **Model**: GPT-4.1-nano
- **Platform**: [OpenAI Platform](https://platform.openai.com/)

**Pros**
- **Fast response time**: 2-3 seconds average response time
- **OpenAI Studio integration** allows you to:
  - Create and test prompts directly
  - Save prompts with unique identifiers
  - **Create multiple prompts with different behaviors** without being locked into one specific prompt
  - **Test prompts directly in the studio** and see exact token usage before implementation
- **Clean prompt architecture**:
  - Multiple prompts for different scenarios (muscle groups, difficulty levels, etc.)
  - Prompts referenced by ID in code for cleaner, more maintainable codebase
  - Supports variable injection into prompts for flexibility

**Cons**
- **Paid usage**: $0.20 per 1M input tokens, $0.05 per 1M cached input tokens, $0.80 per 1M output tokens (see [OpenAI API pricing](https://platform.openai.com/docs/pricing?latest-pricing=priority))

**Conclusion**
The preferred choice for production: stable performance, faster responses, and convenient prompt management.

### Comparison Table
| **Criterion**        | **GPT-OSS-20B (OpenRouter)** | **GPT-4.1-nano (OpenAI)** |
|----------------------|-------------------------------|----------------------------|
| **Cost**             | Free                          | $0.20 (input tokens)/$0.05/$0.80 (output tokens) per 1M tokens |
| **Speed**            | 12-25 seconds                 | 2-3 seconds                |
| **Reliability**      | Moderate                      | High                       |
| **Prompt management**| Limited                       | Advanced (IDs, variables)  |
| **Best for**         | Prototyping                   | Production                 |

### Recommendation
- **Start** with `GPT-4.1-nano` for better performance, scalability, and developer experience.

### Why GPT-4.1-nano is the Best Choice

**Cost Efficiency**
GPT-4.1-nano offers significantly better value compared to newer models like GPT-5-mini:
- **GPT-4.1-nano**: $0.20/$0.05/$0.80 per 1M tokens
- **GPT-5-mini**: $0.45/$0.045/$3.60 per 1M tokens

For simple exercise recommendation tasks, there's no need for the advanced capabilities of GPT-5, making the nano model the most cost-effective choice.

**Cost Calculation for Example Prompt**
Based on our example prompt (368 input + 106 output tokens):
- **Cost per request**: $0.20 × (368/1,000,000) + $0.80 × (106/1,000,000) = $0.0000736 + $0.0000848 = **$0.0001584**
- **Requests per $1**: ~6,313 requests
- **Requests per $100**: ~631,313 requests

This makes it extremely affordable for high-volume usage in production.

**Usage Limits Recommendation**
To control costs and prevent abuse, implement the following limits:
- **Free tier users**: 5 AI-generated workout requests per month
- **Premium users**: 50 AI-generated workout requests per month
- **Enterprise users**: 200 AI-generated workout requests per month

This approach balances user experience with cost control, ensuring the feature remains sustainable while providing value to users.

**Advanced Prompt Management Benefits**
- **Multiple prompt strategies**: Create different prompts for various user types (beginners, advanced, specific goals)
- **Behavioral flexibility**: Each prompt can have different personalities and approaches without code changes
- **Real-time testing**: Test prompts directly in OpenAI Studio to see exact token usage before deployment
- **Iterative optimization**: Easily modify prompts based on performance without touching production code
- **A/B testing ready**: Compare different prompt strategies by switching prompt IDs

### Example Prompt
Here's an example prompt used for both models to generate personalized exercises:

```json
[
    {
        "role": "system",
        "content": "Act as a professional personal fitness trainer and provide expert guidance on fitness and exercise."
    },
    {
        "role": "user",
        "content": "Analyze all provided data about the person (profile, goals, condition) and their current training_days. Using the available exercise_bank, suggest the most suitable exercises for this person. Return only the updated training_days JSON without explanations."
    },
    {
        "role": "assistant",
        "content": "{\"person\": {\"name\": \"John Miller\",\"age\": 29,\"height_cm\": 180,\"weight_kg\": 78,\"goal\": \"calorie burning\",\"favorite_exercises\": [\"treadmill running\",\"barbell squats\",\"plank\"]},\"training_days\": [{\"day\": \"Monday\",\"muscle_groups\": [{\"group_name\": \"chest\",\"exercise\": null},{\"group_name\": \"back\",\"exercise\": null},{\"group_name\": \"legs\",\"exercise\": null},{\"group_name\": \"abs\",\"exercise\": null}]}],\"exercise_bank\": {\"chest\": [\"barbell bench press\",\"dumbbell flyes\",\"push-ups\",\"incline dumbbell press\"],\"back\": [\"lat pulldown\",\"deadlift\",\"hyperextension\",\"one-arm dumbbell row\"],\"legs\": [\"barbell squats\",\"lunges\",\"leg press\",\"standing calf raises\"],\"abs\": [\"crunches\",\"plank\",\"hanging leg raises\",\"russian twists\"]}}"
    }
]
```

**Token Usage for this prompt:**
- Input tokens: 368
- Output tokens: 106

**Example Response:**
```json
{
  "day": "Monday",
  "muscle_groups": [
    {
      "group_name": "chest",
      "exercise": "barbell bench press"
    },
    {
      "group_name": "back",
      "exercise": "lat pulldown"
    },
    {
      "group_name": "legs",
      "exercise": "barbell squats"
    },
    {
      "group_name": "abs",
      "exercise": "plank"
    }
  ]
}
```
