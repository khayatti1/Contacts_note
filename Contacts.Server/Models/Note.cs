namespace contacts.Server.Models
{
    public class Note
    {
        public int Id { get; set; }
        public required string Content { get; set; }
        public required int ContactId { get; set; }
        public required Contact Contact { get; set; }
        public required string CreatedBy { get; set; }

    }
}
