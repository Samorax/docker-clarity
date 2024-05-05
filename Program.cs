using FoodloyaleApi.Data;
using FoodloyaleApi.Filters;
using FoodloyaleApi.Models;
using FoodloyaleApi.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Reflection;
using System.Text;


var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseSqlServer(
            builder.Configuration.GetConnectionString("DefaultConnection"),
         o => o.EnableRetryOnFailure(maxRetryCount: 5,
            maxRetryDelay: System.TimeSpan.FromSeconds(30),
            errorNumbersToAdd: null)));

builder.Services.Configure<FormOptions>(opt =>
{
    opt.MultipartBodyLengthLimit = 268435456;
    opt.MemoryBufferThreshold = Int32.MaxValue;
});

builder.Services.AddIdentityCore<ApplicationUser>()
    .AddEntityFrameworkStores<ApplicationDbContext>();

builder.Services.AddIdentity<FoodloyaleApi.Models.Customer, IdentityRole>()
    .AddEntityFrameworkStores<ApplicationDbContext>();

builder.Services.AddAutoMapper(typeof(Program));



builder.Services.AddMvc().AddNewtonsoftJson(options =>
{
    options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore;
});


builder.Services
     .AddScoped<ApiKeyAuthenticationHandler>()
    .AddSingleton<IClientService, InMemoryClientsService>()
    .AddScoped<ICacheService, CacheService>()
    .AddScoped<IApiKeyService, ApiKeyService>()
    .AddScoped<IEmailSender,EmailSender>()
    .AddScoped<ISmsSender,SmsSender>();


builder.Services.AddAuthentication()
    .AddScheme<ApiKeyAuthenticationOptions, ApiKeyAuthenticationHandler>(ApiKeyAuthenticationOptions.DefaultScheme, null);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(opt =>
{
    opt.RequireHttpsMetadata = false;
    opt.SaveToken = true;
    opt.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters()
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidAudience = builder.Configuration["Jwt:Audience"],
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
    };

});

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo 
    { Title = "Build A Restaurant Website",
      Contact = new OpenApiContact { Email = "hello@foodloyale.com",Name = "Samuel Azeez", Url = new Uri("https://foodloyale.com/documentation")},
      Description = "This API exposes the endpoints to build a general restaurant website inline with Foodloyale prescription",
      Version = "v1" 
    });
    c.AddSecurityDefinition("ApiKey", new OpenApiSecurityScheme
    {
        Description = "API key needed to access the endpoints",
        In = ParameterLocation.Header,
        Name = "X-API-KEY",
        Type = SecuritySchemeType.ApiKey
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement {
        {
            new OpenApiSecurityScheme {
                Reference = new OpenApiReference {
                    Type = ReferenceType.SecurityScheme,
                    Id = "ApiKey"
                }
            },
            new string[] {}
        }
    });
    c.SchemaFilter<SwaggerExcludeFilter>();

  
 
    // using System.Reflection;
    var xmlFilename = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    c.IncludeXmlComments(Path.Combine(AppContext.BaseDirectory, xmlFilename));
    
});

builder.Services.AddCors(opt =>
{
    opt.AddPolicy("AllowlocalClient", policy =>
    {
        policy
    .WithOrigins("*")
    .AllowAnyHeader().AllowAnyMethod();
    });
});

var app = builder.Build();


app.UseStaticFiles();
app.UseAuthentication();
app.UseSwagger();
app.UseSwaggerUI(u=>
{
    u.SwaggerEndpoint("/swagger/v1/swagger.json", "FoodloyaleApi");
    u.DefaultModelsExpandDepth(-1);
});

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}


app.UseCors("AllowlocalClient");

app.UseHttpsRedirection();


app.UseAuthorization();

app.MapControllers();

app.Run();
