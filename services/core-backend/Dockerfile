# 1. Build Aşaması
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Proje dosyasını kopyala ve restore et
COPY ["src/Presentation.API/Presentation.API.csproj", "src/Presentation.API/"]
RUN dotnet restore "src/Presentation.API/Presentation.API.csproj"

# Tüm kodları kopyala
COPY . .
WORKDIR "/src/src/Presentation.API"
RUN dotnet publish "Presentation.API.csproj" -c Release -o /app/publish

# 2. Runtime Aşaması
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
EXPOSE 8080
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Presentation.API.dll"]
