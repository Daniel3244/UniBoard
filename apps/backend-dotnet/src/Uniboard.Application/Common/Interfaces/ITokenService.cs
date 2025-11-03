using Uniboard.Application.Authentication;
using Uniboard.Domain.Entities;

namespace Uniboard.Application.Common.Interfaces;

public interface ITokenService
{
    TokenPair CreateTokenPair(User user);
}
