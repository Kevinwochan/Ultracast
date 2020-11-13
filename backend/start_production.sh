source env/bin/activate
export ULTRACAST_BACKEND_SETTINGS="$(dirname $(realpath $0))/config/production_settings.py"
echo "Using settings file: $ULTRACAST_BACKEND_SETTINGS"
python backend_app.py
