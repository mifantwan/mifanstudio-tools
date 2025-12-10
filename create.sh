#!/bin/bash

# Function to list all environments
list_environments() {
    echo "Existing environments:"
    ls -1 ./env/.[^.]*.env | sed 's/\.env$//' | sed 's/.*\.//'
}

# Function to create new environment
create_environment() {
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
}

# Function to update environment
update_environment() {
    read -p "Enter environment name to update: " filename
    if [ -f "./env/.$filename.env" ]; then
        echo "Select PROJECT_PLATFORM:"
        echo "1) default"
        echo "2) shopify"
        echo "3) wordpress"
        echo "4) components"
        read -p "Enter your choice (1-4): " platform_choice

        case $platform_choice in
            1) PROJECT_PLATFORM="default" ;;
            2) PROJECT_PLATFORM="shopify" ;;
            3) PROJECT_PLATFORM="wordpress" ;;
            4) PROJECT_PLATFORM="components" ;;
            *) PROJECT_PLATFORM="default" ;;
        esac

        # Update both env files
        sed -i "s/PROJECT_PLATFORM=.*/PROJECT_PLATFORM=$PROJECT_PLATFORM/" "./env/.$filename.env"
        sed -i "s/PROJECT_PLATFORM=.*/PROJECT_PLATFORM=$PROJECT_PLATFORM/" "./env/.$filename-dists.env"
        echo "Environment $filename updated successfully!"
    else
        echo "Environment $filename does not exist!"
    fi
}

# Function to delete environment
delete_environment() {
    read -p "Enter environment name to delete: " filename
    if [ -f "./env/.$filename.env" ]; then
        rm "./env/.$filename.env" "./env/.$filename-dists.env"
        rm -rf "./sources/$filename"
        echo "Environment $filename deleted successfully!"
    else
        echo "Environment $filename does not exist!"
    fi
}

# Main menu
while true; do
    echo -e "\nEnvironment Management"
    echo "1. List environments"
    echo "2. Create new environment"
    echo "3. Update environment"
    echo "4. Delete environment"
    echo "5. Exit"
    read -p "Choose an option (1-5): " choice

    case $choice in
        1) list_environments ;;
        2) create_environment ;;
        3) update_environment ;;
        4) delete_environment ;;
        5) exit 0 ;;
        *) echo "Invalid option" ;;
    esac
done
