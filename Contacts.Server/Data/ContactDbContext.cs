using Microsoft.EntityFrameworkCore;
using contacts.Server.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
namespace contacts.Server.Data
{
    public class ContactDbContext : IdentityDbContext<User>

    {
        // Constructeur qui accepte DbContextOptions<ApplicationDbContext>
        public ContactDbContext(DbContextOptions<ContactDbContext> options)
            : base(options)
        { }

        // Définition des DbSets pour vos modèles
        public DbSet<Contact> Contacts { get; set; }
        public DbSet<Group> Groups { get; set; }
        public DbSet<Note> Notes { get; set; }
        public DbSet<Tag> Tags { get; set; }
        // public DbSet<User> Users { get; set; }
    }


}