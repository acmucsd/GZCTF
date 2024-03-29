FROM mcr.microsoft.com/dotnet/sdk:8.0-jammy AS build

ARG TIMESTAMP
ARG GIT_SHA
ARG GIT_NAME
ENV VITE_APP_BUILD_TIMESTAMP=$TIMESTAMP
ENV VITE_APP_GIT_SHA=$GIT_SHA
ENV VITE_APP_GIT_NAME=$GIT_NAME

RUN apt update && apt install -y wget gnupg2 libpcap0.8 && \
    wget -qO- https://deb.nodesource.com/setup_20.x | bash - && \
    apt install -y build-essential nodejs

RUN npm i -g pnpm

COPY [".", "/src"]

WORKDIR "/src/GZCTF"
RUN dotnet build "GZCTF.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "GZCTF.csproj" -c Release -o /app/publish -r linux-x64 --no-self-contained /p:PublishReadyToRun=true

FROM mcr.microsoft.com/dotnet/aspnet:8.0-jammy AS final
WORKDIR /app
EXPOSE 8080

COPY --from=publish /app/publish .
RUN apt update && apt install -y wget libpcap0.8 --no-install-recommends && rm -rf /var/lib/apt/lists/*

HEALTHCHECK --interval=5m --timeout=3s --start-period=10s --retries=1 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/healthz || exit 1

ENTRYPOINT ["dotnet", "GZCTF.dll"]
