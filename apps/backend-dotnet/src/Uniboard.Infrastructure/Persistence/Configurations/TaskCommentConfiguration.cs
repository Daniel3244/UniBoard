using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Uniboard.Domain.Entities;

namespace Uniboard.Infrastructure.Persistence.Configurations;

internal sealed class TaskCommentConfiguration : IEntityTypeConfiguration<TaskComment>
{
    public void Configure(EntityTypeBuilder<TaskComment> builder)
    {
        builder.ToTable("task_comments");

        builder.HasKey(comment => comment.Id);

        builder.Property(comment => comment.Body)
            .IsRequired()
            .HasMaxLength(2000);

        builder.Property(comment => comment.AuthorEmail)
            .IsRequired()
            .HasMaxLength(320);

        builder.HasIndex(comment => new { comment.TaskId, comment.CreatedAt });

        builder.HasOne(comment => comment.Task)
            .WithMany()
            .HasForeignKey(comment => comment.TaskId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
