namespace contacts.Server.Models
{
    public class Group
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public required ICollection<Contact> Contacts { get; set; }
    }
}
