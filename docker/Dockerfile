# [BACKEND]
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS backend-build
WORKDIR /source
# [BACKEND] copy csproj and restore as distinct layers
COPY *.sln .
COPY src/Api/*.csproj ./src/Api/
COPY src/Application/*.csproj ./src/Application/
COPY src/Domain/*.csproj ./src/Domain/
RUN dotnet restore
# [BACKEND] copy everything else and build app
COPY src/. ./src/
WORKDIR /source/src/Api
RUN dotnet publish -c Release -o /app --no-restore --self-contained --runtime linux-x64;

# [FRONTEND]
FROM node:23-alpine AS frontend-build
COPY ./ui /app
WORKDIR /app
RUN npm install
RUN npm run build

# final stage/image
FROM ubuntu/nginx
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        curl \
        ca-certificates \
        libicu-dev \
        python3 \
        python3-pip \
        unzip

COPY --from=frontend-build /app/dist/ui/browser /usr/share/nginx/html
COPY /docker/nginx.conf /etc/nginx/nginx.conf
COPY /docker/start.sh /app/start.sh

WORKDIR /app

# Download yt-dlp and ffmpeg
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /app/yt-dlp \
    && chmod +x /app/yt-dlp

RUN curl -L https://github.com/ffbinaries/ffbinaries-prebuilt/releases/download/v6.1/ffmpeg-6.1-linux-64.zip -o /app/ffmpeg.zip \
    && unzip /app/ffmpeg.zip -d /app \
    && chmod +x /app/ffmpeg \
    && rm /app/ffmpeg.zip

COPY --from=backend-build /app ./

EXPOSE 80
EXPOSE 5000

RUN chmod +x ./Api ./start.sh
ENTRYPOINT ["bash", "./start.sh"]