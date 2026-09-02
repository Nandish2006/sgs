FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copy csproj and restore as distinct layers
COPY backend/GrievanceApi/*.csproj ./backend/GrievanceApi/
WORKDIR /app/backend/GrievanceApi
RUN dotnet restore

# Copy everything else and build
WORKDIR /app
COPY backend/GrievanceApi/. ./backend/GrievanceApi/
WORKDIR /app/backend/GrievanceApi
RUN dotnet publish -c Release -o out

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/backend/GrievanceApi/out .

# Expose port (Render uses PORT env variable or defaults to 10000, but typically ASP.NET uses 8080 in .NET 8)
# We will tell render to use port 8080 or just let it map automatically.
ENV ASPNETCORE_HTTP_PORTS=8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "GrievanceApi.dll"]
