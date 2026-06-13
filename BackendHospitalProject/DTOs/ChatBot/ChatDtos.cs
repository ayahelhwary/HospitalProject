namespace BackendHospitalProject.DTOs.Chatbot;

public class ChatMessageDto
{
    public string Role { get; set; } = "user"; // "user" or "assistant"
    public string Content { get; set; } = string.Empty;
}

public class ChatRequestDto
{
    public List<ChatMessageDto> Messages { get; set; } = new();
}

public class ChatReplyDto
{
    public string Reply { get; set; } = string.Empty;
}
