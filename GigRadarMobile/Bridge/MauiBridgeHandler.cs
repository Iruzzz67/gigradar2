using System.Text.Json;
using Microsoft.Maui.Devices.Sensors;
using Microsoft.Maui.ApplicationModel.DataTransfer;

namespace GigRadarMobile.Bridge
{
    public class BridgeMessage
    {
        public string Command { get; set; } = string.Empty;
        public JsonElement? Payload { get; set; }
        public string? RequestId { get; set; }
    }

    public class BridgeResponse<T>
    {
        public bool Success { get; set; }
        public T? Data { get; set; }
        public BridgeError? Error { get; set; }
    }

    public class BridgeError
    {
        public string Code { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
    }

    public class MauiBridgeHandler
    {
        private readonly WebView _webView;

        public MauiBridgeHandler(WebView webView)
        {
            _webView = webView;
        }

        public async Task<string> HandleMessageAsync(string jsonMessage)
        {
            try
            {
                var msg = JsonSerializer.Deserialize<BridgeMessage>(jsonMessage, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                if (msg == null) return CreateErrorResponse("INVALID_JSON", "Pesan bridge tidak valid.");

                switch (msg.Command)
                {
                    case "location.getCurrent":
                        return await HandleGetLocationAsync(msg.RequestId);

                    case "system.vibrate":
                        try
                        {
                            Vibration.Default.Vibrate(TimeSpan.FromMilliseconds(50));
                        }
                        catch { }
                        return CreateSuccessResponse(new { status = "vibrated" }, msg.RequestId);

                    case "system.share":
                        if (msg.Payload.HasValue && msg.Payload.Value.TryGetProperty("name", out var titleProp))
                        {
                            await Share.Default.RequestAsync(new ShareTextRequest
                            {
                                Title = titleProp.GetString(),
                                Text = $"GigRadar Event: {titleProp.GetString()}"
                            });
                        }
                        return CreateSuccessResponse(new { shared = true }, msg.RequestId);

                    case "system.openExternalLink":
                        if (msg.Payload.HasValue && msg.Payload.Value.TryGetProperty("url", out var urlProp))
                        {
                            var uri = new Uri(urlProp.GetString() ?? "");
                            await Launcher.Default.OpenAsync(uri);
                        }
                        return CreateSuccessResponse(new { opened = true }, msg.RequestId);

                    default:
                        return CreateErrorResponse("UNKNOWN_COMMAND", $"Perintah {msg.Command} tidak dikenali.", msg.RequestId);
                }
            }
            catch (Exception ex)
            {
                return CreateErrorResponse("HANDLER_EXCEPTION", ex.Message);
            }
        }

        private async Task<string> HandleGetLocationAsync(string? requestId)
        {
            try
            {
                var status = await Permissions.CheckStatusAsync<Permissions.LocationWhenInUse>();
                if (status != PermissionStatus.Granted)
                {
                    status = await Permissions.RequestAsync<Permissions.LocationWhenInUse>();
                }

                if (status == PermissionStatus.Granted)
                {
                    var location = await Geolocation.Default.GetLocationAsync(new GeolocationRequest
                    {
                        DesiredAccuracy = GeolocationAccuracy.Medium,
                        Timeout = TimeSpan.FromSeconds(5)
                    });

                    if (location != null)
                    {
                        return CreateSuccessResponse(new
                        {
                            latitude = location.Latitude,
                            longitude = location.Longitude
                        }, requestId);
                    }
                }

                // Fallback coordinates: Jakarta Selatan Scene Center
                return CreateSuccessResponse(new
                {
                    latitude = -6.2297,
                    longitude = 106.8184
                }, requestId);
            }
            catch (Exception ex)
            {
                return CreateErrorResponse("LOCATION_ERROR", ex.Message, requestId);
            }
        }

        private string CreateSuccessResponse<T>(T data, string? requestId = null)
        {
            var res = new BridgeResponse<T>
            {
                Success = true,
                Data = data,
                Error = null
            };
            return JsonSerializer.Serialize(res);
        }

        private string CreateErrorResponse(string code, string message, string? requestId = null)
        {
            var res = new BridgeResponse<object>
            {
                Success = false,
                Data = null,
                Error = new BridgeError { Code = code, Message = message }
            };
            return JsonSerializer.Serialize(res);
        }
    }
}
