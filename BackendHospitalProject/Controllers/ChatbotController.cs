using Microsoft.AspNetCore.Mvc;
using System.Text;
using System.Text.Json;
using BackendHospitalProject.DTOs.Chatbot;
using Microsoft.AspNetCore.Authorization;

namespace BackendHospitalProject.Controllers;

[ApiController]
[Route("api/chatbot")]
[AllowAnonymous]
public class ChatbotController(IHttpClientFactory httpClientFactory, IConfiguration config) : ControllerBase
{
    private const string SystemPrompt = @"You are a smart assistant for a specialized hospital. Your job is to help patients and visitors with:
- Navigating the website sections (Home, Departments, Doctors, Appointments, About Us, Contact Us)
- Providing general information about medical departments (Cardiology, Neurology, Oncology, Orthopedics, Eye)
- Recommending the appropriate department based on symptoms
- Answering general questions about the hospital

CRITICAL RULES:
- ALWAYS reply in the EXACT same language the user writes in. English message = English reply. Arabic message = Arabic reply. No exceptions.
- NEVER use foreign words or mix languages. If replying in Arabic, use proper formal Arabic only.
- Be brief, friendly, and well-formatted. Use bullet points or short paragraphs.
- Never provide final medical diagnoses, always direct the patient to visit a doctor.
- Booking is done only through the website. Only mention the hotline 19668 if the user has a problem booking online.
- When mentioning any page, always write a clickable link.
- If the user asks about anything related to eyes, vision, or eye examination, always include both links: [تحليل العين](http://localhost:8080/eye-diagnosis) و [الأقسام](http://localhost:8080/departments)
- Website links: [Home](http://localhost:8080/) - [Departments](http://localhost:8080/departments) - [Doctors](http://localhost:8080/doctors) - [Book Appointment](http://localhost:8080/appointments) - [Eye Analysis](http://localhost:8080/eye-diagnosis) - [About Us](http://localhost:8080/about) - [Contact Us](http://localhost:8080/contact)
- When replying in Arabic, use Arabic link names. When replying in English, use English link names. NEVER mix Arabic and English in the same reply.
- NEVER use any symbols, characters, or words from Chinese, Japanese, Vietnamese, or any other language. Only use Arabic or English depending on the user's language.
- Always make links clickable in your replies.";

    [HttpPost]
    public async Task<IActionResult> Chat([FromBody] ChatRequestDto dto)
    {
        var apiKey = config["Groq:ApiKey"];
        if (string.IsNullOrEmpty(apiKey))
            return Ok(new ChatReplyDto { Reply = "عذراً، الخدمة غير مهيأة حالياً." });

        try
        {
            var client = httpClientFactory.CreateClient();

            // ✅ Add Authorization header BEFORE sending request
            client.DefaultRequestHeaders.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", apiKey);

            var messages = new List<object>
            {
                new { role = "system", content = SystemPrompt }
            };
            messages.AddRange(dto.Messages
                .Where(m => !string.IsNullOrWhiteSpace(m.Content))
                .Select(m => new { role = m.Role, content = m.Content }));

            var requestBody = new
            {
                model = "llama-3.3-70b-versatile",
                messages,
                max_tokens = 512
            };

            var response = await client.PostAsync(
                "https://api.groq.com/openai/v1/chat/completions",
                new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json"));

            var responseText = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
                return Ok(new ChatReplyDto { Reply = "عذراً، حدث خطأ. يرجى المحاولة لاحقاً." });

            using var doc = JsonDocument.Parse(responseText);
            var reply = doc.RootElement
                .GetProperty("choices")[0]
                .GetProperty("message")
                .GetProperty("content")
                .GetString() ?? "عذراً، لم أتمكن من فهم طلبك.";

            return Ok(new ChatReplyDto { Reply = reply });
        }
        catch
        {
            return Ok(new ChatReplyDto { Reply = "عذراً، حدث خطأ. يرجى المحاولة لاحقاً." });
        }
    }
}
