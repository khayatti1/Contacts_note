namespace contacts.Server.Models
{
    public class Contact
    {
        public int Id { get; set; }
        public required string? Image { get; set; }
        public required string Name { get; set; }
        public required string Email { get; set; }
        public required string Phone { get; set; }
        public required string Address { get; set; }
        public required DateOnly DateCreation { get; set; }
        public required int GroupId { get; set; }
        public required Group Group { get; set; }
        public Note? Notes { get; set; }
        public ICollection<Tag>? Tags { get; set; }
        public required string CreatedBy { get; set; }

    }
}
