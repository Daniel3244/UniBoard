using AutoMapper;
using Uniboard.Api.Contracts.Comments;
using Uniboard.Domain.Entities;

namespace Uniboard.Api.Mapping;

public sealed class CommentMappingProfile : Profile
{
    public CommentMappingProfile()
    {
        CreateMap<TaskComment, CommentResponse>();
    }
}
