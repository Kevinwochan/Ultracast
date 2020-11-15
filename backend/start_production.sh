source env/bin/activate
if [[ -z "${ULTRACAST_BACKEND_SETTINGS}" ]]; then
    export ULTRACAST_BACKEND_SETTINGS="$(dirname $(realpath $0))/config/production_settings.py"
fi
echo "Using settings file: $ULTRACAST_BACKEND_SETTINGS"
python backend_app.py
