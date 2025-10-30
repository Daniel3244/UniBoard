using AutoMapper;
using Uniboard.Api.Contracts.Tasks;
using Uniboard.Domain.Entities;

namespace Uniboard.Api.Mapping;

public sealed class TaskMappingProfile : Profile
{
    public TaskMappingProfile()
    {
        CreateMap<TaskItem, TaskResponse>();

        CreateMap<CreateTaskRequest, TaskItem>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.ProjectId, opt => opt.Ignore())
            .ForMember(dest => dest.Project, opt => opt.Ignore());

        CreateMap<UpdateTaskRequest, TaskItem>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.ProjectId, opt => opt.Ignore())
            .ForMember(dest => dest.Project, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore());
    }
}
