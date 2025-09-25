import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// Initialize the Gemini AI
const genAI = new GoogleGenerativeAI('AIzaSyBB1NKAQPg8S8_pozh0f_fd64ct9_Xl0ME');

// Women's health related keywords and topics
const WOMENS_HEALTH_KEYWORDS = [
  'menstruation', 'period', 'menstrual', 'pms', 'cramps', 'ovulation', 'fertility',
  'pregnancy', 'prenatal', 'postnatal', 'breastfeeding', 'lactation', 'contraception',
  'birth control', 'gynecology', 'cervical', 'ovarian', 'uterine', 'vaginal',
  'breast', 'mammogram', 'pap smear', 'menopause', 'hormones', 'estrogen', 'progesterone',
  'endometriosis', 'pcos', 'fibroids', 'yeast infection', 'uti', 'reproductive health',
  'sexual health', 'libido', 'osteoporosis', 'iron deficiency', 'prenatal vitamins',
  'maternal health', 'postpartum', 'miscarriage', 'infertility', 'ovaries', 'fallopian',
  'cesarean', 'episiotomy', 'morning sickness', 'gestational diabetes', 'preeclampsia',
  'mood swings', 'hot flashes', 'night sweats', 'vaginal dryness', 'kegel exercises',
  'pelvic floor', 'cervix', 'labia', 'clitoris', 'vulva', 'discharge', 'spotting',
  'irregular periods', 'heavy bleeding', 'light periods', 'missed period', 'late period',
  'early period', 'ovarian cysts', 'breast pain', 'breast lumps', 'nipple discharge',
  'mastitis', 'thrush', 'bacterial vaginosis', 'std', 'sti', 'hpv', 'herpes',
  'chlamydia', 'gonorrhea', 'syphilis', 'hiv', 'aids', 'women health', 'female health',
  'gynecologist', 'obstetrician', 'midwife', 'doula', 'fertility specialist'
];

// Check if the message is related to women's health
function isWomensHealthRelated(message) {
  const lowerMessage = message.toLowerCase();
  
  // Check for direct keyword matches
  const hasKeyword = WOMENS_HEALTH_KEYWORDS.some(keyword => 
    lowerMessage.includes(keyword.toLowerCase())
  );
  
  // Additional context patterns
  const contextPatterns = [
    /women.{0,20}health/i,
    /female.{0,20}health/i,
    /reproductive.{0,20}system/i,
    /menstrual.{0,20}cycle/i,
    /pregnancy.{0,20}symptoms/i,
    /breast.{0,20}exam/i,
    /pelvic.{0,20}exam/i,
    /birth.{0,20}control/i,
    /family.{0,20}planning/i,
    /maternal.{0,20}care/i
  ];
  
  const hasContextPattern = contextPatterns.some(pattern => pattern.test(lowerMessage));
  
  return hasKeyword || hasContextPattern;
}

export async function POST(request) {
  let message = '';
  try {
    const requestData = await request.json();
    message = requestData.message || '';
    const conversationHistory = requestData.conversationHistory || [];
    const isAkanInput = requestData.isAkanInput || false;
    const language = requestData.language || 'tw'; // Default to Twi

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    let translatedMessage = message;
    let originalMessage = message;

    // If the input is in Akan, translate it to English first
    if (isAkanInput) {
      try {
        const translateResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/translate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: message,
            from: language,
            to: 'en'
          })
        });

        if (translateResponse.ok) {
          const translateData = await translateResponse.json();
          translatedMessage = translateData.translatedText;
          originalMessage = message;
        } else {
          console.error('Translation failed, using original message');
        }
      } catch (translateError) {
        console.error('Translation error:', translateError);
        // Continue with original message if translation fails
      }
    }

    // Check if the message is related to women's health (use translated message for check)
    if (!isWomensHealthRelated(translatedMessage)) {
      let responseText = "Hi there! I'm Pinky Trust AI, and I'm here to help specifically with women's health questions. I can assist you with topics like menstrual health, pregnancy, reproductive health, breast health, hormonal changes, and other women's health concerns. Could you please ask me something related to women's health? 💕";
      
      // If input was in Akan, translate the response back
      if (isAkanInput) {
        try {
          const translateBackResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/translate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              text: responseText,
              from: 'en',
              to: language
            })
          });

          if (translateBackResponse.ok) {
            const translateBackData = await translateBackResponse.json();
            responseText = translateBackData.translatedText;
          }
        } catch (translateError) {
          console.error('Response translation error:', translateError);
        }
      }
      
      return NextResponse.json({
        response: responseText,
        isRelevant: false,
        isAkanInput,
        originalMessage,
        translatedMessage: isAkanInput ? translatedMessage : null
      });
    }

    // Get the generative model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Create a comprehensive prompt for women's health
    const systemPrompt = `You are Pinky Trust AI, a compassionate and knowledgeable AI assistant specializing exclusively in women's health. Your personality is warm, supportive, and empathetic, using a caring tone that makes women feel comfortable discussing sensitive health topics.

IMPORTANT GUIDELINES:
1. ONLY respond to questions related to women's health topics including: menstrual health, pregnancy, reproductive health, breast health, hormonal changes, menopause, contraception, gynecological issues, maternal health, sexual health, and general wellness for women.

2. Always provide accurate, evidence-based information while being supportive and non-judgmental.

3. Use a warm, friendly tone with occasional appropriate emojis (💕, 🌸, 💪, 🤗) to create a comfortable atmosphere.

4. Always recommend consulting with healthcare professionals for serious concerns, diagnosis, or treatment decisions.

5. Be sensitive to cultural differences and personal circumstances.

6. If asked about non-women's health topics, politely redirect the conversation back to women's health.

7. Provide practical, actionable advice when appropriate.

8. Be encouraging and supportive, especially for sensitive topics.

FORMATTING REQUIREMENTS:
- Use proper markdown formatting for better readability
- Use **bold text** for important points and section headers
- Use bullet points (*) for lists and options
- Structure longer responses with clear sections like:
  **Lifestyle Changes:**
  * Point 1
  * Point 2
  
  **Medical Options:**
  * Point 1
  * Point 2
  
  **When to See a Doctor:**
  * Important warning signs
- Keep paragraphs concise and well-spaced
- Use emojis sparingly but appropriately to maintain warmth

Remember: You are here to support, educate, and empower women in their health journey. Always prioritize safety and encourage professional medical consultation when needed.`;

    // Build conversation context using translated message for AI processing
    let conversationContext = systemPrompt + '\n\nConversation History:\n';
    
    conversationHistory.forEach((msg, index) => {
      conversationContext += `${msg.role === 'user' ? 'User' : 'Pinky Trust AI'}: ${msg.content}\n`;
    });
    
    conversationContext += `\nUser: ${translatedMessage}\n\nPinky Trust AI:`;

    // Generate response
    const result = await model.generateContent(conversationContext);
    const response = result.response;
    let responseText = response.text();

    // If input was in Akan, translate the response back to Akan
    if (isAkanInput) {
      try {
        const translateBackResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/translate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: responseText,
            from: 'en',
            to: language
          })
        });

        if (translateBackResponse.ok) {
          const translateBackData = await translateBackResponse.json();
          responseText = translateBackData.translatedText;
        }
      } catch (translateError) {
        console.error('Response translation error:', translateError);
        // Continue with English response if translation fails
      }
    }

    return NextResponse.json({
      response: responseText,
      isRelevant: true,
      isAkanInput,
      originalMessage,
      translatedMessage: isAkanInput ? translatedMessage : null,
      language
    });

  } catch (error) {
    console.error('Error in chat API:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    // If it's a Google API error about service being disabled, provide a helpful fallback
    if (error.message && error.message.includes('SERVICE_DISABLED')) {
      const fallbackResponses = {
        'breast cancer': `I understand you're asking about **breast cancer**, which is an important women's health topic. 🌸

**Key Information:**
* Breast cancer is one of the most common cancers affecting women
* Early detection through regular self-exams and mammograms is crucial

**Warning Signs to Watch For:**
* Lumps or thickening in the breast or underarm
* Changes in breast size or shape
* Skin dimpling or puckering
* Nipple discharge or changes
* Persistent breast pain

**Important:** Please consult with a healthcare professional or oncologist for personalized information and screening recommendations. Early detection saves lives! 💕`,

        'menstrual': `**Menstrual health** is so important for your overall wellbeing! 🌸

**Normal Cycle Facts:**
* Typical cycle: 21-35 days
* Bleeding duration: 3-7 days
* Slight variations are completely normal

**Tips for Better Menstrual Health:**
* Track your periods to understand your pattern
* Stay hydrated and eat nutritious foods
* Light exercise can help with cramps

**When to See a Doctor:**
* Significant changes in your cycle
* Severe pain that interferes with daily life
* Very heavy or very light bleeding
* Periods that stop completely

Taking care of your menstrual health is taking care of your overall wellbeing! 💪`,

        'pregnancy': `**Pregnancy** is an incredible journey! If you suspect you might be pregnant, here's what you should know: 🤗

**First Steps:**
* Take a home pregnancy test
* Schedule an appointment with an OB/GYN
* Start prenatal vitamins with folic acid

**Important Pregnancy Care:**
* Eat nutritious, balanced meals
* Stay well-hydrated
* Avoid alcohol and smoking
* Get adequate rest

**Remember:** Every pregnancy is unique, so always consult with healthcare professionals for personalized guidance throughout your journey. Early prenatal care is essential for both you and your baby's health! 💕`,

        'default': `Thank you for your women's health question! 🌸

While I'm currently experiencing a temporary connection issue, I want you to know that **your health concerns are important**.

**For Immediate Help:**
* Consult with a healthcare professional
* Call a women's health hotline
* Visit reputable medical websites like ACOG (American College of Obstetricians and Gynecologists)

Please try again later, and I'll be here to help! Your health and wellbeing matter. 💕`
      };

      // Find the most relevant fallback response
      const lowerMessage = message.toLowerCase();
      let fallbackResponse = fallbackResponses.default;
      
      for (const [key, response] of Object.entries(fallbackResponses)) {
        if (key !== 'default' && lowerMessage.includes(key)) {
          fallbackResponse = response;
          break;
        }
      }

      return NextResponse.json({
        response: fallbackResponse,
        isRelevant: true,
        isFallback: true
      });
    }

    return NextResponse.json(
      { error: 'Sorry, I encountered an issue. Please try again.', details: error.message },
      { status: 500 }
    );
  }
}
