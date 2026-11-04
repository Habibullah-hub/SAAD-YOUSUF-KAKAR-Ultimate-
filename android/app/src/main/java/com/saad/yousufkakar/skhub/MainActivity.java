package com.saad.yousufkakar.skhub;

import android.app.Activity;
import android.app.AlertDialog;
import android.app.DownloadManager;
import android.os.Bundle;
import android.os.Build;
import android.os.Environment;
import android.graphics.Color;
import android.graphics.Typeface;
import android.view.Gravity;
import android.view.View;
import android.view.inputmethod.EditorInfo;
import android.view.inputmethod.InputMethodManager;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.webkit.CookieManager;
import android.webkit.DownloadListener;
import android.webkit.URLUtil;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.ValueCallback;
import android.webkit.WebResourceError;
import android.webkit.SslErrorHandler;
import android.net.http.SslError;
import android.content.ActivityNotFoundException;
import android.content.pm.PackageManager;
import android.widget.ArrayAdapter;
import android.widget.AutoCompleteTextView;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;
import android.text.Editable;
import android.text.TextWatcher;
import android.os.Handler;
import android.os.Looper;

import org.json.JSONArray;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;

public class MainActivity extends Activity {
    private static final String HOME = "https://habibullah-hub.github.io/SAAD-YOUSUF-KAKAR-Ultimate-/";
    private static final String PREFS = "sk_browser_data";
    private static final String HISTORY = "history";
    private static final int FILE_CHOOSER_REQUEST = 901;
    private ValueCallback<Uri[]> filePathCallback;
    private boolean clearSiteHistoryAfterHome = false;
    private String pendingDownloadUrl, pendingDownloadAgent, pendingDownloadDisposition, pendingDownloadMime;
    private WebView web;
    private AutoCompleteTextView address;
    private ProgressBar progress;
    private TextView loadingLabel;
    private ArrayAdapter<String> suggestionAdapter;
    private final Handler handler = new Handler(Looper.getMainLooper());
    private Runnable suggestionTask;
    private final int navy = Color.rgb(7, 20, 33);
    private final int panel = Color.rgb(20, 45, 64);
    private final int teal = Color.rgb(105, 230, 211);
    private final List<String> recent = new ArrayList<>();
    private DownloadManager downloadManager;

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().setStatusBarColor(navy);
        getWindow().setNavigationBarColor(navy);
        downloadManager = (DownloadManager)getSystemService(DOWNLOAD_SERVICE);
        loadHistory();

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(navy);

        LinearLayout top = new LinearLayout(this);
        top.setGravity(Gravity.CENTER_VERTICAL);
        top.setPadding(dp(10), dp(7), dp(10), dp(5));
        top.setBackgroundColor(navy);
        TextView logo = new TextView(this);
        logo.setText("SK✦");
        logo.setTextColor(teal);
        logo.setTextSize(20);
        logo.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        top.addView(logo, new LinearLayout.LayoutParams(dp(48), dp(44)));

        address = new AutoCompleteTextView(this);
        address.setSingleLine(true);
        address.setTextSize(14);
        address.setHint("Search the web · live suggestions via Google");
        address.setHintTextColor(Color.LTGRAY);
        address.setTextColor(Color.WHITE);
        address.setDropDownBackgroundDrawable(new android.graphics.drawable.ColorDrawable(panel));
        address.setSelectAllOnFocus(true);
        address.setImeOptions(EditorInfo.IME_ACTION_GO);
        address.setThreshold(1);
        address.setPadding(dp(10), 0, dp(6), 0);
        address.setBackgroundTintList(android.content.res.ColorStateList.valueOf(teal));
        suggestionAdapter = new ArrayAdapter<>(this, android.R.layout.simple_dropdown_item_1line, new ArrayList<>());
        address.setAdapter(suggestionAdapter);
        top.addView(address, new LinearLayout.LayoutParams(0, dp(44), 1));

        Button go = button("GO");
        top.addView(go, new LinearLayout.LayoutParams(dp(52), dp(44)));
        root.addView(top);

        progress = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
        progress.setMax(100);
        progress.setProgressTintList(android.content.res.ColorStateList.valueOf(teal));
        progress.setProgressBackgroundTintList(android.content.res.ColorStateList.valueOf(panel));
        progress.setVisibility(View.GONE);
        root.addView(progress, new LinearLayout.LayoutParams(-1, dp(3)));
        loadingLabel = new TextView(this);
        loadingLabel.setTextColor(teal);
        loadingLabel.setTextSize(10);
        loadingLabel.setPadding(dp(12), dp(2), dp(12), dp(2));
        loadingLabel.setVisibility(View.GONE);
        root.addView(loadingLabel);

        web = new WebView(this);
        WebSettings settings = web.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(false);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setSupportMultipleWindows(false);
        settings.setJavaScriptCanOpenWindowsAutomatically(false);
        settings.setSupportZoom(true);
        settings.setBuiltInZoomControls(true);
        settings.setDisplayZoomControls(false);
        settings.setMediaPlaybackRequiresUserGesture(true);
        CookieManager cookieManager = CookieManager.getInstance();
        cookieManager.setAcceptCookie(true);
        if (Build.VERSION.SDK_INT >= 21) cookieManager.setAcceptThirdPartyCookies(web, false);
        if (Build.VERSION.SDK_INT >= 26) settings.setSafeBrowsingEnabled(true);
        web.setWebChromeClient(new WebChromeClient() {
            @Override public void onProgressChanged(WebView view, int value) {
                progress.setIndeterminate(false);
                progress.setProgress(value);
                if (value >= 100) finishLoading();
                else if (value > 0) showLoading("Loading page · " + value + "%");
            }
            @Override public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (filePathCallback != null) filePathCallback.onReceiveValue(null);
                filePathCallback = callback;
                Intent pick;
                try {
                    // Respect the web page's accept/capture hints so Android can offer
                    // the camera when a photo input requests capture.
                    pick = params.createIntent();
                } catch (Exception ignored) {
                    pick = new Intent(Intent.ACTION_GET_CONTENT);
                    pick.addCategory(Intent.CATEGORY_OPENABLE);
                    pick.setType("*/*");
                }
                try {
                    startActivityForResult(Intent.createChooser(pick, "Choose a file for SK Cyber Hub"), FILE_CHOOSER_REQUEST);
                    return true;
                } catch (ActivityNotFoundException e) {
                    filePathCallback = null;
                    Toast.makeText(MainActivity.this, "No file picker is available on this device.", Toast.LENGTH_SHORT).show();
                    return false;
                }
            }
        });
        web.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return handleNavigation(view, request.getUrl());
            }
            @SuppressWarnings("deprecation")
            @Override public boolean shouldOverrideUrlLoading(WebView view, String url) {
                return handleNavigation(view, Uri.parse(url));
            }
            @Override public void onPageStarted(WebView view, String url, android.graphics.Bitmap icon) {
                address.setText(url);
                showLoading("Opening securely…");
            }
            @Override public void onPageFinished(WebView view, String url) {
                address.setText(url);
                if (clearSiteHistoryAfterHome && url.startsWith(HOME)) {
                    clearSiteHistoryAfterHome = false;
                    view.evaluateJavascript("try{localStorage.removeItem('sk-browser-history');sessionStorage.clear();}catch(e){}", null);
                    view.clearHistory();
                } else {
                    remember(url);
                }
                finishLoading();
            }
            @Override public void onReceivedSslError(WebView view, SslErrorHandler handler, SslError error) {
                handler.cancel();
                finishLoading();
                Toast.makeText(MainActivity.this, "Unsafe or invalid website certificate. Connection blocked.", Toast.LENGTH_LONG).show();
            }
            @Override public void onReceivedError(WebView view, WebResourceRequest request, android.webkit.WebResourceError error) {
                if (request.isForMainFrame()) {
                    finishLoading();
                    Toast.makeText(MainActivity.this, "Page could not load. Check your connection and try again.", Toast.LENGTH_LONG).show();
                }
            }
        });
        web.setDownloadListener(new DownloadListener() {
            @Override public void onDownloadStart(String url, String userAgent, String contentDisposition, String mimeType, long contentLength) {
                startDownload(url, userAgent, contentDisposition, mimeType);
            }
        });
        web.setOverScrollMode(View.OVER_SCROLL_NEVER);
        root.addView(web, new LinearLayout.LayoutParams(-1, 0, 1));

        LinearLayout nav = new LinearLayout(this);
        nav.setGravity(Gravity.CENTER);
        nav.setPadding(dp(5), dp(5), dp(5), dp(5));
        nav.setBackgroundColor(navy);
        Button back = button("‹");
        Button forward = button("›");
        Button home = button("⌂");
        Button history = button("◷");
        Button downloads = button("⬇");
        Button refresh = button("↻");
        Button[] controls = {back, forward, home, history, downloads, refresh};
        for (Button control : controls) {
            LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(0, dp(46), 1);
            lp.setMargins(dp(2), 0, dp(2), 0);
            nav.addView(control, lp);
        }
        root.addView(nav);
        setContentView(root);

        go.setOnClickListener(v -> navigateFromAddress());
        address.setOnEditorActionListener((v, action, event) -> {
            if (action == EditorInfo.IME_ACTION_GO || action == EditorInfo.IME_ACTION_DONE) { navigateFromAddress(); return true; }
            return false;
        });
        address.addTextChangedListener(new TextWatcher() {
            @Override public void beforeTextChanged(CharSequence s, int start, int count, int after) {}
            @Override public void onTextChanged(CharSequence s, int start, int before, int count) { if (address.hasFocus()) requestSuggestions(s.toString()); }
            @Override public void afterTextChanged(Editable e) {}
        });
        address.setOnItemClickListener((parent, view, position, id) -> navigateFromAddress());
        back.setOnClickListener(v -> { if (web.canGoBack()) web.goBack(); else Toast.makeText(this, "No previous page", Toast.LENGTH_SHORT).show(); });
        forward.setOnClickListener(v -> { if (web.canGoForward()) web.goForward(); else Toast.makeText(this, "No next page", Toast.LENGTH_SHORT).show(); });
        home.setOnClickListener(v -> web.loadUrl(HOME));
        history.setOnClickListener(v -> showHistory());
        downloads.setOnClickListener(v -> showDownloads());
        refresh.setOnClickListener(v -> { showLoading("Refreshing…"); web.reload(); });
        if (state == null) web.loadUrl(HOME);
        else if (web.restoreState(state) == null) web.loadUrl(HOME);
    }

    private boolean handleNavigation(WebView view, Uri uri) {
        String scheme = uri.getScheme() == null ? "" : uri.getScheme().toLowerCase();
        if ("https".equals(scheme)) return false;
        if ("http".equals(scheme)) {
            Uri secure = uri.buildUpon().scheme("https").build();
            view.loadUrl(secure.toString());
            return true;
        }
        if ("mailto".equals(scheme) || "tel".equals(scheme) || "market".equals(scheme)) {
            try { startActivity(new Intent(Intent.ACTION_VIEW, uri)); }
            catch (Exception e) { Toast.makeText(this, "No app is available for this link", Toast.LENGTH_SHORT).show(); }
            return true;
        }
        return true;
    }

    private void navigateFromAddress() {
        String q = address.getText().toString().trim();
        if (q.isEmpty()) return;
        address.dismissDropDown();
        String url;
        if (q.matches("(?i)^https?://.*")) url = q;
        else if (q.matches("(?i)^[a-z0-9.-]+\\.[a-z]{2,}(:[0-9]{1,5})?(/.*)?$")) url = "https://" + q;
        else url = "https://www.google.com/search?q=" + Uri.encode(q);
        hideKeyboard();
        showLoading("Searching the web…");
        web.loadUrl(url);
    }

    private void requestSuggestions(String raw) {
        final String q = raw.trim();
        if (suggestionTask != null) handler.removeCallbacks(suggestionTask);
        if (q.length() < 2 || q.contains("://") || q.matches("(?i)^[a-z0-9.-]+\\.[a-z]{2,}(:[0-9]{1,5})?(/.*)?$")) { suggestionAdapter.clear(); suggestionAdapter.notifyDataSetChanged(); return; }
        suggestionTask = () -> new Thread(() -> {
            HttpURLConnection connection = null;
            try {
                String endpoint = "https://suggestqueries.google.com/complete/search?client=firefox&q=" + URLEncoder.encode(q, "UTF-8");
                connection = (HttpURLConnection)new URL(endpoint).openConnection();
                connection.setConnectTimeout(3500);
                connection.setReadTimeout(3500);
                connection.setRequestProperty("User-Agent", "SKBrowser/1.0");
                BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream(), "UTF-8"));
                StringBuilder data = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) data.append(line);
                reader.close();
                JSONArray array = new JSONArray(data.toString());
                JSONArray values = array.getJSONArray(1);
                List<String> items = new ArrayList<>();
                for (int i = 0; i < values.length() && i < 7; i++) items.add(values.getString(i));
                runOnUiThread(() -> {
                    if (address != null && address.hasFocus() && address.getText().toString().trim().equals(q)) {
                        suggestionAdapter.clear();
                        suggestionAdapter.addAll(items);
                        suggestionAdapter.notifyDataSetChanged();
                        if (!items.isEmpty()) address.showDropDown();
                    }
                });
            } catch (Exception ignored) {
            } finally { if (connection != null) connection.disconnect(); }
        }).start();
        handler.postDelayed(suggestionTask, 320);
    }

    private void startDownload(String url, String userAgent, String disposition, String mimeType) {
        try {
            Uri downloadUri = Uri.parse(url);
            String scheme = downloadUri.getScheme() == null ? "" : downloadUri.getScheme().toLowerCase();
            if ("http".equals(scheme)) downloadUri = downloadUri.buildUpon().scheme("https").build();
            else if (!"https".equals(scheme)) {
                Toast.makeText(this, "For safety, SK Browser downloads only HTTPS files.", Toast.LENGTH_LONG).show();
                return;
            }
            if (Build.VERSION.SDK_INT <= 28 && checkSelfPermission(android.Manifest.permission.WRITE_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED) {
                pendingDownloadUrl = downloadUri.toString();
                pendingDownloadAgent = userAgent;
                pendingDownloadDisposition = disposition;
                pendingDownloadMime = mimeType;
                requestPermissions(new String[]{android.Manifest.permission.WRITE_EXTERNAL_STORAGE}, 902);
                Toast.makeText(this, "Allow storage access to save this download in the public Downloads folder.", Toast.LENGTH_LONG).show();
                return;
            }
            String fileName = URLUtil.guessFileName(downloadUri.toString(), disposition, mimeType);
            fileName = fileName.replaceAll("[\\\\/:*?\"<>|]", "_").replaceAll("\\.{2,}", ".");
            if (fileName.trim().isEmpty()) fileName = "SK-download";
            DownloadManager.Request request = new DownloadManager.Request(downloadUri);
            String cookie = CookieManager.getInstance().getCookie(downloadUri.toString());
            if (cookie != null) request.addRequestHeader("Cookie", cookie);
            if (userAgent != null) request.addRequestHeader("User-Agent", userAgent);
            request.setMimeType(mimeType);
            request.setTitle(fileName);
            request.setDescription("Downloading with SK Browser");
            request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
            request.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, fileName);
            downloadManager.enqueue(request);
            Toast.makeText(this, "Download started · check notifications or Downloads", Toast.LENGTH_LONG).show();
        } catch (Exception e) {
            Toast.makeText(this, "Download could not start for this link", Toast.LENGTH_LONG).show();
        }
    }

    private void showDownloads() {
        DownloadManager.Query query = new DownloadManager.Query();
        android.database.Cursor cursor = downloadManager.query(query);
        List<String> rows = new ArrayList<>();
        List<Long> ids = new ArrayList<>();
        List<Integer> statuses = new ArrayList<>();
        if (cursor != null) {
            int idCol = cursor.getColumnIndex(DownloadManager.COLUMN_ID);
            int titleCol = cursor.getColumnIndex(DownloadManager.COLUMN_TITLE);
            int statusCol = cursor.getColumnIndex(DownloadManager.COLUMN_STATUS);
            while (cursor.moveToNext()) {
                long id = idCol >= 0 ? cursor.getLong(idCol) : -1;
                String title = titleCol >= 0 ? cursor.getString(titleCol) : "Download";
                int status = statusCol >= 0 ? cursor.getInt(statusCol) : -1;
                String state = status == DownloadManager.STATUS_SUCCESSFUL ? "Completed · tap to open" : status == DownloadManager.STATUS_FAILED ? "Failed" : "In progress";
                rows.add(title + " — " + state);
                ids.add(id);
                statuses.add(status);
            }
            cursor.close();
        }
        if (rows.isEmpty()) rows.add("No downloads yet. Download a file from a webpage.");
        new AlertDialog.Builder(this).setTitle("SK Downloads").setItems(rows.toArray(new String[0]), (d, which) -> {
            if (which < ids.size() && statuses.get(which) == DownloadManager.STATUS_SUCCESSFUL) {
                Uri fileUri = downloadManager.getUriForDownloadedFile(ids.get(which));
                if (fileUri != null) {
                    String type = downloadManager.getMimeTypeForDownloadedFile(ids.get(which));
                    Intent open = new Intent(Intent.ACTION_VIEW).setDataAndType(fileUri, type == null ? "*/*" : type).addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                    try { startActivity(open); } catch (ActivityNotFoundException e) { Toast.makeText(this, "No app can open this file.", Toast.LENGTH_SHORT).show(); }
                }
            }
        }).setPositiveButton("Close", null).show();
    }

    private void showHistory() {
        loadHistory();
        List<String> items = new ArrayList<>(recent);
        items.add("🧹  Clear all history");
        new AlertDialog.Builder(this).setTitle("SK Browser · History").setItems(items.toArray(new String[0]), (dialog, which) -> {
            if (which == items.size() - 1) {
                recent.clear();
                getSharedPreferences(PREFS, MODE_PRIVATE).edit().remove(HISTORY).apply();
                if (web != null) {
                    web.clearHistory();
                    clearSiteHistoryAfterHome = true;
                    web.loadUrl(HOME);
                }
                Toast.makeText(this, "Browsing history cleared", Toast.LENGTH_SHORT).show();
            } else if (which < recent.size()) {
                String entry = recent.get(which);
                if (entry.startsWith("http")) web.loadUrl(entry);
                else web.loadUrl("https://www.google.com/search?q=" + Uri.encode(entry));
            }
        }).setNegativeButton("Close", null).show();
    }

    private void loadHistory() {
        recent.clear();
        String stored = getSharedPreferences(PREFS, MODE_PRIVATE).getString(HISTORY, "");
        if (!stored.isEmpty()) {
            try {
                JSONArray a = new JSONArray(stored);
                for (int i = 0; i < a.length() && i < 40; i++) recent.add(a.getString(i));
            } catch (Exception ignored) {}
        }
    }

    private void remember(String item) {
        if (item == null || item.trim().isEmpty() || item.equals("about:blank")) return;
        String value = item.trim();
        recent.remove(value);
        recent.add(0, value);
        while (recent.size() > 40) recent.remove(recent.size() - 1);
        getSharedPreferences(PREFS, MODE_PRIVATE).edit().putString(HISTORY, new JSONArray(recent).toString()).apply();
    }

    private void showLoading(String message) {
        progress.setVisibility(View.VISIBLE);
        progress.setIndeterminate(true);
        loadingLabel.setText("●  " + message);
        loadingLabel.setVisibility(View.VISIBLE);
    }

    private void finishLoading() {
        if (progress == null) return;
        progress.setIndeterminate(false);
        progress.setProgress(100);
        progress.setVisibility(View.GONE);
        loadingLabel.setVisibility(View.GONE);
    }

    @Override public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == 902) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED && pendingDownloadUrl != null) {
                String url = pendingDownloadUrl, agent = pendingDownloadAgent, disposition = pendingDownloadDisposition, mime = pendingDownloadMime;
                pendingDownloadUrl = pendingDownloadAgent = pendingDownloadDisposition = pendingDownloadMime = null;
                startDownload(url, agent, disposition, mime);
            } else {
                pendingDownloadUrl = pendingDownloadAgent = pendingDownloadDisposition = pendingDownloadMime = null;
                Toast.makeText(this, "Storage permission was not granted; download cancelled.", Toast.LENGTH_LONG).show();
            }
        }
    }

    @Override protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == FILE_CHOOSER_REQUEST && filePathCallback != null) {
            Uri[] result = null;
            if (resultCode == RESULT_OK && data != null) {
                Uri selected = data.getData();
                if (selected != null) result = new Uri[]{selected};
            }
            filePathCallback.onReceiveValue(result);
            filePathCallback = null;
        }
    }

    private void hideKeyboard() {
        try { ((InputMethodManager)getSystemService(Context.INPUT_METHOD_SERVICE)).hideSoftInputFromWindow(address.getWindowToken(), 0); }
        catch (Exception ignored) {}
    }

    private Button button(String label) {
        Button b = new Button(this);
        b.setText(label);
        b.setTextColor(teal);
        b.setTextSize(13);
        b.setAllCaps(false);
        b.setMinWidth(0);
        b.setPadding(0, 0, 0, 0);
        b.setBackgroundTintList(android.content.res.ColorStateList.valueOf(panel));
        return b;
    }
    private int dp(int v) { return (int)(v * getResources().getDisplayMetrics().density + 0.5f); }
    @Override protected void onSaveInstanceState(Bundle out) { super.onSaveInstanceState(out); if (web != null) web.saveState(out); }
    @Override public void onBackPressed() { if (web != null && web.canGoBack()) web.goBack(); else super.onBackPressed(); }
    @Override protected void onDestroy() {
        if (suggestionTask != null) handler.removeCallbacks(suggestionTask);
        if (filePathCallback != null) { filePathCallback.onReceiveValue(null); filePathCallback = null; }
        if (web != null) { web.stopLoading(); web.destroy(); web = null; }
        super.onDestroy();
    }
}
