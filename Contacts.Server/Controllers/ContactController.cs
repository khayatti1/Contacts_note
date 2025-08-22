using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using contacts.Server.Data;
using contacts.Server.Models;
using Microsoft.AspNetCore.Authorization;
using System.IO;
using System.Security.Claims;

namespace contacts.Controllers
{
    [Route("api/Contact")]
    [ApiController]
    [Authorize]
    public class ContactController : ControllerBase
    {
        private readonly ContactDbContext _context;

        public ContactController(ContactDbContext context)
        {
            _context = context;
        }

        // GET: Contact
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Contact>>> GetContacts()
        {
            string userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var contacts = await _context.Contacts
              .Where(x => x.CreatedBy == userId)
            .Include(c => c.Group)
                .Include(c => c.Notes)
                .Include(c => c.Tags)
                .ToListAsync();

            return Ok(contacts);
        }

        // GET: Contact/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Contact>> GetContact(int id)
        {
            string userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var contact = await _context.Contacts
              .Where(x => x.CreatedBy == userId)
                .Include(c => c.Group)
                .Include(c => c.Notes)
                .Include(c => c.Tags)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (contact == null)
            {
                return NotFound();
            }

            return Ok(contact);
        }

        // POST: Contact
        [HttpPost]
        public async Task<ActionResult<Contact>> CreateContact(
            [FromForm] string name,
            [FromForm] string email,
            [FromForm] string phone,
            [FromForm] string address,
            [FromForm] string? note,
            [FromForm] int groupId,
            [FromForm] IFormFile? image)
        {
            if (string.IsNullOrWhiteSpace(name) || string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(phone) || string.IsNullOrWhiteSpace(address))
            {
                return BadRequest(new { message = "Name, Email, Phone, and Address are required fields." });
            }

            string userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var contact = new Contact
            {
                Name = name,
                Email = email,
                Phone = phone,
                Address = address,
                GroupId = groupId,
                Image = "",
                CreatedBy= userId,
                DateCreation = DateOnly.FromDateTime(DateTime.Now),
                Group = await _context.Groups.FindAsync(groupId) ?? await _context.Groups.FindAsync(1), // Default to GroupId 1
            };

            // Handle image upload
            if (image != null && image.Length > 0)
            {
                var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images");
                var uniqueFileName = $"{Guid.NewGuid()}_{image.FileName}";
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                Directory.CreateDirectory(uploadsFolder); // Ensure directory exists

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await image.CopyToAsync(stream);
                }

                contact.Image = $"/images/{uniqueFileName}";
            }
            else
            {
                contact.Image = ""; // Fallback default image
            }

            _context.Contacts.Add(contact);
            await _context.SaveChangesAsync();

            if (note != null)
            {
                Note newNote = new Note
                {
                    Content = note,
                    Contact = contact,
                    ContactId = contact.Id,
                    CreatedBy = userId,
                };

                _context.Notes.Add(newNote);
                await _context.SaveChangesAsync();
            }

            return CreatedAtAction(nameof(GetContact), new { id = contact.Id }, contact);
        }

        // PUT: Contact/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult<Contact>> UpdateContact(
            int id,
            [FromForm] string name,
            [FromForm] string email,
            [FromForm] string phone,
            [FromForm] string address,
            [FromForm] string? note,
            [FromForm] int groupId,
            [FromForm] IFormFile? image)
        {
            var contact = await _context.Contacts.Include(c => c.Group).Include(c => c.Notes).Include(c => c.Tags).FirstOrDefaultAsync(c => c.Id == id) ?? await _context.Contacts.FindAsync(id);

            string userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            
            if (contact == null)
            {
                return NotFound(new { message = "Contact not found." });
            }

            if (string.IsNullOrWhiteSpace(name) || string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(phone) || string.IsNullOrWhiteSpace(address))
            {
                return BadRequest(new { message = "Name, Email, Phone, and Address are required fields." });
            }

            // Update contact fields
            contact.Name = name;
            contact.Email = email;
            contact.Phone = phone;
            contact.Address = address;
            contact.GroupId = groupId;
            contact.Group = await _context.Groups.FindAsync(groupId) ?? await _context.Groups.FindAsync(1); // Default to GroupId 1

            // Handle image upload
            if (image != null && image.Length > 0)
            {
                var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images");
                var uniqueFileName = $"{Guid.NewGuid()}_{image.FileName}";
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                Directory.CreateDirectory(uploadsFolder); // Ensure directory exists

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await image.CopyToAsync(stream);
                }

                contact.Image = $"/images/{uniqueFileName}";
            }

            // Update or add note
            if (note == null || string.IsNullOrEmpty(note))
            {
                // Delete existing note if note is empty or null
                var existingNote = await _context.Notes.FirstOrDefaultAsync(n => n.ContactId == id);
                if (existingNote != null)
                {
                    _context.Notes.Remove(existingNote);
                    await _context.SaveChangesAsync();
                }
            }
            else
            {
                var existingNote = await _context.Notes.FirstOrDefaultAsync(n => n.ContactId == id);
                if (existingNote != null)
                {
                    existingNote.Content = note;
                    _context.Notes.Update(existingNote);
                }
                else
                {
                    Note newNote = new Note
                    {
                        Content = note,
                        Contact = contact,
                        ContactId = contact.Id,
                        CreatedBy = userId,
                    };

                    _context.Notes.Add(newNote);
                }

                await _context.SaveChangesAsync();
            }

            _context.Contacts.Update(contact);
            await _context.SaveChangesAsync();

            return Ok(contact);
        }

        // DELETE: Contact/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteContact(int id)
        {
            var contact = await _context.Contacts.FindAsync(id);
            if (contact == null)
            {
                return NotFound();
            }

            // Check if the contact has an image and delete it from the server
            if (!string.IsNullOrEmpty(contact.Image))
            {
                var imagePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", contact.Image.TrimStart('/'));
                if (System.IO.File.Exists(imagePath))
                {
                    System.IO.File.Delete(imagePath);
                }
            }

            _context.Contacts.Remove(contact);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: Contact/tag/5
        [HttpPost("tag/{id}")]
        public async Task<IActionResult> AddTag(int id, [FromForm] string name)
        {
            string userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(name))
            {
                return BadRequest("Tag name is required.");
            }

            var contact = await _context.Contacts.FindAsync(id);

            if (contact == null)
            {
                return NotFound();
            }

            if (contact.Tags == null)
            {
                contact.Tags = new List<Tag>();
            }

            var tag = new Tag
            {
                Name = name,
                Contacts = new List<Contact> { contact },
                CreatedBy = userId
            };

            contact.Tags.Add(tag);
            _context.Contacts.Update(contact);
            await _context.SaveChangesAsync();

            return Ok(tag);
        }
    }

     [Route("Group")]
    [ApiController]
    [Authorize]
    public class GroupController : ControllerBase
    {
        private readonly ContactDbContext _context;

        public GroupController(ContactDbContext context)
        {
            _context = context;
        }

        // GET: Groups
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Group>>> GetGroups()
        {
            var groups = await _context.Groups.ToListAsync();
            return Ok(groups);
        }

        // GET: Groups/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Group>> GetGroup(int id)
        {
            var group = await _context.Groups
                .FirstOrDefaultAsync(g => g.Id == id);

            if (group == null)
            {
                return NotFound();
            }

            return Ok(group);
        }
    }

    [Route("Tags")]
    [ApiController]
    [Authorize]
    public class TagsController : ControllerBase
    {
        private readonly ContactDbContext _context;

        public TagsController(ContactDbContext context)
        {
            _context = context;
        }

        // GET: api/Tags
        [HttpGet]
    public async Task<ActionResult<IEnumerable<Tag>>> GetTags()  // Change 'Tags' to 'Tag'
    {
        string userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var tags = await _context.Tags.Where(x => x.CreatedBy == userId).ToListAsync();  // Change 'Tag' to 'Tags'
        return Ok(tags);
    }

        // DELETE: api/Tag/5
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteTag(int id)
        {
            var tag = await _context.Tags.FindAsync(id);
            if (tag == null)
            {
                return NotFound();
            }
            _context.Tags.Remove(tag);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
