# Configuration

There are a set of config files in ./config.
You can set which of these you would like to use, or create your own and use it with the environment variable `ULTRACAST_BACKEND_SETTINGS`.
This must be a *realpath*
For example:

```
export ULTRACAST_BACKEND_SETTINGS=$(realpath config/development_settings.py)
python webserver/reset_db.py
```
