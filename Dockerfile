# Build context is the repository root so that only the server sources are sent
# to the daemon; .dockerignore excludes the Angular client and build artifacts.

FROM mcr.microsoft.com/dotnet/sdk:10.0-noble AS build
WORKDIR /src

# Copy project files first so the restore layer is cached independently of source.
COPY server/KanniMeat.Api/KanniMeat.Api.csproj server/KanniMeat.Api/
COPY server/KanniMeat.Application/KanniMeat.Application.csproj server/KanniMeat.Application/
COPY server/KanniMeat.Domain/KanniMeat.Domain.csproj server/KanniMeat.Domain/
COPY server/KanniMeat.Infrastructure/KanniMeat.Infrastructure.csproj server/KanniMeat.Infrastructure/

RUN dotnet restore server/KanniMeat.Api/KanniMeat.Api.csproj

COPY server/ server/
RUN dotnet publish server/KanniMeat.Api/KanniMeat.Api.csproj \
        --configuration Release \
        --no-restore \
        --output /app

FROM mcr.microsoft.com/dotnet/aspnet:10.0-noble AS runtime
WORKDIR /app

# Run as the non-root user that ships with the aspnet image.
USER $APP_UID

COPY --from=build /app ./

ENV ASPNETCORE_HTTP_PORTS=10000 \
    DOTNET_gcServer=0

EXPOSE 10000

ENTRYPOINT ["dotnet", "KanniMeat.Api.dll"]
