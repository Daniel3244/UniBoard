# syntax=docker/dockerfile:1.7-labs

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY ["Uniboard.sln", "./"]
COPY ["src/Uniboard.Api/Uniboard.Api.csproj", "src/Uniboard.Api/"]
COPY ["src/Uniboard.Application/Uniboard.Application.csproj", "src/Uniboard.Application/"]
COPY ["src/Uniboard.Domain/Uniboard.Domain.csproj", "src/Uniboard.Domain/"]
COPY ["src/Uniboard.Infrastructure/Uniboard.Infrastructure.csproj", "src/Uniboard.Infrastructure/"]
COPY ["tests/Uniboard.Api.Tests/Uniboard.Api.Tests.csproj", "tests/Uniboard.Api.Tests/"]
COPY ["tests/Uniboard.Api.IntegrationTests/Uniboard.Api.IntegrationTests.csproj", "tests/Uniboard.Api.IntegrationTests/"]

RUN dotnet restore "Uniboard.sln"

COPY . .

RUN dotnet publish "src/Uniboard.Api/Uniboard.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "Uniboard.Api.dll"]
