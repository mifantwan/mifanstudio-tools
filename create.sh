#!/bin/bash

# Get filename from user
read -p "Enter filename for environment files: " filename

# Create the main .env file
echo "Creating file .$filename.env"
touch ./env/.$filename.env

# Create the dists .env file
echo "Creating file .$filename-dists.env"
touch ./env/.$filename-dists.env

# Platform selector
echo "Select PROJECT_PLATFORM:"
echo "1) default"
echo "2) shopify"
echo "3) wordpress"
echo "4) components"
read -p "Enter your choice (1-4): " platform_choice

# Set platform based on choice
case $platform_choice in
    1) PROJECT_PLATFORM="default" ;;
    2) PROJECT_PLATFORM="shopify" ;;
    3) PROJECT_PLATFORM="wordpress" ;;
    4) PROJECT_PLATFORM="components" ;;
    *) PROJECT_PLATFORM="default" ;;
esac

# Write content to main .env file (development environment)
cat > ./env/.$filename.env << EOF
# DEVELOPMENT Environment
PROJECT_DOMAIN=$filename
# development, staging, production
PROJECT_STATUS=development
PROJECT_SOURCE=sources
PROJECT_DEST=preview
PROJECT_PLATFORM=$PROJECT_PLATFORM
EOF

# Write content to dists .env file (production environment)
cat > ./env/.$filename-dists.env << EOF
# PRODUCTION Environment
PROJECT_DOMAIN=$filename
# development, staging, production
PROJECT_STATUS=production
PROJECT_SOURCE=sources
PROJECT_DEST=dists
PROJECT_PLATFORM=$PROJECT_PLATFORM
EOF

# Create folder structure in sources based on filename
echo "Creating folder structure in sources/$filename"
mkdir -p ./sources/$filename

# Copy the folder structure from local
echo "Copying folder structure from sources/local to sources/$filename"
cp -r ./sources/local/* ./sources/$filename/

echo "Files .$filename.env and .$filename-dists.env created successfully!"
echo "PROJECT_DOMAIN set to: $filename"
echo "PROJECT_PLATFORM set to: $PROJECT_PLATFORM"
echo "Folder structure created at: sources/$filename"

