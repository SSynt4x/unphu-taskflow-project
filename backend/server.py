from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import resend
import asyncio
import random

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'taskflow-lite-secret-key-2024')
JWT_ALGORITHM = "HS256"

# Resend Configuration
resend.api_key = os.environ.get('RESEND_API_KEY', '')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')

# Create the main app
app = FastAPI(title="TaskFlow Lite API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

security = HTTPBearer()

# Gamification Ranks
RANKS = [
    {"name": "Procrastinador", "min_points": 0, "color": "gray"},
    {"name": "Freshman", "min_points": 300, "color": "emerald"},
    {"name": "Sophomore", "min_points": 500, "color": "blue"},
    {"name": "Business Man", "min_points": 800, "color": "purple"},
    {"name": "Soldier", "min_points": 1200, "color": "yellow"}
]

# Avatars for redemption - Extended collection
AVATARS = [
    # Básicos (100-500 pts)
    {"id": "owl_baby", "name": "Búho Bebé", "price": 100, "image": "🐣", "category": "basic"},
    {"id": "owl_sleepy", "name": "Búho Dormilón", "price": 200, "image": "😴", "category": "basic"},
    {"id": "owl_happy", "name": "Búho Feliz", "price": 300, "image": "😊", "category": "basic"},
    {"id": "owl_cool", "name": "Búho Cool", "price": 400, "image": "😎", "category": "basic"},
    {"id": "owl_basic", "name": "Búho Estudiante", "price": 500, "image": "🦉", "category": "basic"},
    # Intermedios (1000-3000 pts)
    {"id": "owl_glasses", "name": "Búho Intelectual", "price": 1000, "image": "🤓", "category": "intermediate"},
    {"id": "owl_book", "name": "Búho Lector", "price": 1500, "image": "📚", "category": "intermediate"},
    {"id": "owl_smart", "name": "Búho Sabio", "price": 2000, "image": "🧠", "category": "intermediate"},
    {"id": "owl_studious", "name": "Búho Estudioso", "price": 3000, "image": "✏️", "category": "intermediate"},
    # Avanzados (5000-10000 pts)
    {"id": "owl_graduate", "name": "Búho Graduado", "price": 5000, "image": "🎓", "category": "advanced"},
    {"id": "owl_professor", "name": "Búho Profesor", "price": 6000, "image": "👨‍🏫", "category": "advanced"},
    {"id": "owl_scientist", "name": "Búho Científico", "price": 7000, "image": "🔬", "category": "advanced"},
    {"id": "owl_astronaut", "name": "Búho Astronauta", "price": 8000, "image": "🚀", "category": "advanced"},
    {"id": "owl_soldier", "name": "Búho Soldado", "price": 10000, "image": "🎖️", "category": "advanced"},
    # Legendarios (15000-25000 pts)
    {"id": "owl_king", "name": "Búho Rey", "price": 15000, "image": "👑", "category": "legendary"},
    {"id": "owl_diamond", "name": "Búho Diamante", "price": 20000, "image": "💎", "category": "legendary"},
    {"id": "owl_golden", "name": "Búho Dorado", "price": 25000, "image": "🏆", "category": "legendary"},
]

# Point packages for purchase
POINT_PACKAGES = [
    {"id": "pack_100", "points": 100, "price_usd": 2, "price_dop": 100},
    {"id": "pack_500", "points": 500, "price_usd": 10, "price_dop": 500},
    {"id": "pack_1000", "points": 1000, "price_usd": 18, "price_dop": 1000},
    {"id": "pack_2500", "points": 2500, "price_usd": 40, "price_dop": 2500},
    {"id": "pack_5000", "points": 5000, "price_usd": 75, "price_dop": 5000},
]

def get_rank(points: int) -> dict:
    current_rank = RANKS[0]
    for rank in RANKS:
        if points >= rank["min_points"]:
            current_rank = rank
    return current_rank

# ==================== MODELS ====================

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: str
    name: str
    points: int
    rank: dict
    created_at: str

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    due_date: str
    due_time: Optional[str] = "12:00"

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[str] = None
    due_time: Optional[str] = None
    status: Optional[str] = None

class TaskResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    title: str
    description: str
    due_date: str
    due_time: str
    status: str
    created_at: str
    updated_at: str

class FuturePlanCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    target_date: Optional[str] = None

class FuturePlanUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    target_date: Optional[str] = None

class FuturePlanResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    title: str
    description: str
    target_date: Optional[str]
    created_at: str

class ActivityResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    action: str
    description: str
    points_earned: int
    created_at: str

# New models for courses, assignments, friends
class CourseCreate(BaseModel):
    name: str
    code: str
    color: Optional[str] = "#10B981"
    description: Optional[str] = ""

class ModuleCreate(BaseModel):
    course_id: str
    title: str
    content: str
    order: int = 0

class AssignmentCreate(BaseModel):
    course_id: str
    module_id: Optional[str] = None
    title: str
    description: str
    due_date: str
    due_time: Optional[str] = "23:59"
    points: int = 10

class FriendRequest(BaseModel):
    friend_email: str

class PurchasePoints(BaseModel):
    package_id: str
    payment_method: str
    card_number: Optional[str] = None

class VerificationRequest(BaseModel):
    email: str

class VerifyCodeRequest(BaseModel):
    email: str
    code: str

class MessageCreate(BaseModel):
    to_user_id: str
    content: str

class GroupCreate(BaseModel):
    name: str
    description: Optional[str] = ""

class GroupTaskCreate(BaseModel):
    group_id: str
    title: str
    description: Optional[str] = ""
    due_date: str

# ==================== HELPERS ====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, email: str) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc).timestamp() + 86400 * 7  # 7 days
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"id": payload["user_id"]}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def log_activity(user_id: str, action: str, description: str, points: int = 0):
    activity = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "action": action,
        "description": description,
        "points_earned": points,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.activities.insert_one(activity)
    return activity

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/send-code")
async def send_verification_code(data: VerificationRequest):
    email = data.email.strip().lower()
    
    # Generate 6-digit code
    code = str(random.randint(100000, 999999))
    expires_at = (datetime.now(timezone.utc) + timedelta(minutes=10)).isoformat()
    
    # Store code in DB (upsert)
    await db.verification_codes.update_one(
        {"email": email},
        {"$set": {"email": email, "code": code, "expires_at": expires_at, "verified": False}},
        upsert=True
    )
    
    # Send email via Resend
    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0a0f0a; padding: 40px 30px; border-radius: 12px; border: 1px solid #10b981;">
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #10b981; font-size: 24px; margin: 0;">TaskFlow Lite</h1>
            <p style="color: #6b7280; font-size: 14px; margin-top: 5px;">UNPHU - Verificación de Cuenta</p>
        </div>
        <div style="text-align: center; padding: 25px; background: #111; border-radius: 8px; margin-bottom: 20px;">
            <p style="color: #d1d5db; font-size: 14px; margin: 0 0 15px 0;">Tu código de verificación es:</p>
            <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #10b981; font-family: monospace;">{code}</div>
        </div>
        <p style="color: #6b7280; font-size: 12px; text-align: center;">Este código expira en 10 minutos. Si no solicitaste este código, ignora este correo.</p>
    </div>
    """
    
    try:
        params = {
            "from": SENDER_EMAIL,
            "to": [email],
            "subject": f"TaskFlow Lite - Código de verificación: {code}",
            "html": html_content
        }
        await asyncio.to_thread(resend.Emails.send, params)
        return {"message": "Código enviado", "expires_in_minutes": 10}
    except Exception as e:
        logging.error(f"Failed to send email: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al enviar el correo: {str(e)}")

@api_router.post("/auth/verify-code")
async def verify_code(data: VerifyCodeRequest):
    email = data.email.strip().lower()
    record = await db.verification_codes.find_one({"email": email}, {"_id": 0})
    
    if not record:
        raise HTTPException(status_code=400, detail="No se encontró un código para este correo")
    
    if record["code"] != data.code:
        raise HTTPException(status_code=400, detail="Código incorrecto")
    
    if datetime.fromisoformat(record["expires_at"]) < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="El código ha expirado, solicita uno nuevo")
    
    # Mark as verified
    await db.verification_codes.update_one(
        {"email": email},
        {"$set": {"verified": True}}
    )
    
    return {"message": "Código verificado correctamente", "verified": True}

@api_router.post("/auth/register", response_model=dict)
async def register(user_data: UserCreate):
    email = user_data.email.strip().lower()
    
    # Check if email is verified
    verification = await db.verification_codes.find_one({"email": email}, {"_id": 0})
    if not verification or not verification.get("verified"):
        raise HTTPException(status_code=400, detail="Debes verificar tu correo antes de registrarte")
    
    existing = await db.users.find_one({"email": email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    user = {
        "id": user_id,
        "email": user_data.email,
        "password": hash_password(user_data.password),
        "name": user_data.name,
        "points": 0,
        "redeemable_points": 0,
        "unlocked_avatars": [],
        "current_avatar": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user)
    await log_activity(user_id, "register", f"User {user_data.name} registered")
    
    # Clean up verification code
    await db.verification_codes.delete_one({"email": email})
    
    token = create_token(user_id, user_data.email)
    return {
        "token": token,
        "user": {
            "id": user_id,
            "email": user_data.email,
            "name": user_data.name,
            "points": 0,
            "redeemable_points": 0,
            "unlocked_avatars": [],
            "current_avatar": None,
            "rank": get_rank(0)
        }
    }

@api_router.post("/auth/login", response_model=dict)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user["id"], user["email"])
    await log_activity(user["id"], "login", f"User {user['name']} logged in")
    
    return {
        "token": token,
        "user": {
            "id": user["id"],
            "email": user["email"],
            "name": user["name"],
            "points": user["points"],
            "redeemable_points": user.get("redeemable_points", 0),
            "unlocked_avatars": user.get("unlocked_avatars", []),
            "current_avatar": user.get("current_avatar"),
            "rank": get_rank(user["points"])
        }
    }

@api_router.get("/auth/me", response_model=dict)
async def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "id": current_user["id"],
        "email": current_user["email"],
        "name": current_user["name"],
        "points": current_user["points"],
        "redeemable_points": current_user.get("redeemable_points", 0),
        "unlocked_avatars": current_user.get("unlocked_avatars", []),
        "current_avatar": current_user.get("current_avatar"),
        "rank": get_rank(current_user["points"])
    }

# ==================== TASK ROUTES ====================

@api_router.post("/tasks", response_model=TaskResponse)
async def create_task(task_data: TaskCreate, current_user: dict = Depends(get_current_user)):
    task_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    task = {
        "id": task_id,
        "user_id": current_user["id"],
        "title": task_data.title,
        "description": task_data.description or "",
        "due_date": task_data.due_date,
        "due_time": task_data.due_time or "12:00",
        "status": "pending",
        "created_at": now,
        "updated_at": now
    }
    await db.tasks.insert_one(task)
    await log_activity(current_user["id"], "task_created", f"Created task: {task_data.title}")
    return TaskResponse(**task)

@api_router.get("/tasks", response_model=List[TaskResponse])
async def get_tasks(current_user: dict = Depends(get_current_user)):
    tasks = await db.tasks.find({"user_id": current_user["id"]}, {"_id": 0}).to_list(1000)
    return [TaskResponse(**t) for t in tasks]

@api_router.put("/tasks/{task_id}", response_model=TaskResponse)
async def update_task(task_id: str, task_data: TaskUpdate, current_user: dict = Depends(get_current_user)):
    task = await db.tasks.find_one({"id": task_id, "user_id": current_user["id"]}, {"_id": 0})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    update_data = {k: v for k, v in task_data.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    # Handle status change to completed - award points
    points_earned = 0
    redeemable_earned = 0
    if task_data.status == "completed" and task["status"] != "completed":
        points_earned = 10
        redeemable_earned = 5
        await db.users.update_one(
            {"id": current_user["id"]},
            {"$inc": {"points": points_earned, "redeemable_points": redeemable_earned}}
        )
        await log_activity(current_user["id"], "task_completed", f"Completed task: {task['title']} (+10 pts rango, +5 canjeables)", points_earned)
    elif task_data.status and task_data.status != task["status"]:
        await log_activity(current_user["id"], "task_status_changed", f"Changed status of '{task['title']}' to {task_data.status}")
    
    await db.tasks.update_one({"id": task_id}, {"$set": update_data})
    updated_task = await db.tasks.find_one({"id": task_id}, {"_id": 0})
    return TaskResponse(**updated_task)

@api_router.delete("/tasks/{task_id}")
async def delete_task(task_id: str, current_user: dict = Depends(get_current_user)):
    task = await db.tasks.find_one({"id": task_id, "user_id": current_user["id"]}, {"_id": 0})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Move to trash instead of permanent delete
    trash_item = {**task, "deleted_at": datetime.now(timezone.utc).isoformat()}
    await db.trash.insert_one(trash_item)
    await db.tasks.delete_one({"id": task_id})
    await log_activity(current_user["id"], "task_deleted", f"Moved to trash: {task['title']}")
    return {"message": "Task moved to trash"}

# ==================== TRASH ROUTES ====================

@api_router.get("/trash")
async def get_trash(current_user: dict = Depends(get_current_user)):
    items = await db.trash.find({"user_id": current_user["id"]}, {"_id": 0}).sort("deleted_at", -1).to_list(200)
    return items

@api_router.post("/trash/{task_id}/restore")
async def restore_from_trash(task_id: str, current_user: dict = Depends(get_current_user)):
    item = await db.trash.find_one({"id": task_id, "user_id": current_user["id"]}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Item not found in trash")
    
    restored = {k: v for k, v in item.items() if k != "deleted_at"}
    await db.tasks.insert_one(restored)
    await db.trash.delete_one({"id": task_id})
    await log_activity(current_user["id"], "task_restored", f"Restored: {item['title']}")
    return {"message": "Task restored"}

@api_router.delete("/trash/{task_id}/permanent")
async def permanent_delete(task_id: str, current_user: dict = Depends(get_current_user)):
    item = await db.trash.find_one({"id": task_id, "user_id": current_user["id"]})
    if not item:
        raise HTTPException(status_code=404, detail="Item not found in trash")
    await db.trash.delete_one({"id": task_id})
    return {"message": "Permanently deleted"}

@api_router.delete("/trash/empty")
async def empty_trash(current_user: dict = Depends(get_current_user)):
    result = await db.trash.delete_many({"user_id": current_user["id"]})
    return {"message": f"Trash emptied ({result.deleted_count} items)"}

# ==================== FUTURE PLANS ROUTES ====================

@api_router.post("/plans", response_model=FuturePlanResponse)
async def create_plan(plan_data: FuturePlanCreate, current_user: dict = Depends(get_current_user)):
    plan_id = str(uuid.uuid4())
    plan = {
        "id": plan_id,
        "user_id": current_user["id"],
        "title": plan_data.title,
        "description": plan_data.description or "",
        "target_date": plan_data.target_date,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.future_plans.insert_one(plan)
    await log_activity(current_user["id"], "plan_created", f"Created future plan: {plan_data.title}")
    return FuturePlanResponse(**plan)

@api_router.get("/plans", response_model=List[FuturePlanResponse])
async def get_plans(current_user: dict = Depends(get_current_user)):
    plans = await db.future_plans.find({"user_id": current_user["id"]}, {"_id": 0}).to_list(1000)
    return [FuturePlanResponse(**p) for p in plans]

@api_router.put("/plans/{plan_id}", response_model=FuturePlanResponse)
async def update_plan(plan_id: str, plan_data: FuturePlanUpdate, current_user: dict = Depends(get_current_user)):
    plan = await db.future_plans.find_one({"id": plan_id, "user_id": current_user["id"]}, {"_id": 0})
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    update_data = {k: v for k, v in plan_data.model_dump().items() if v is not None}
    await db.future_plans.update_one({"id": plan_id}, {"$set": update_data})
    updated_plan = await db.future_plans.find_one({"id": plan_id}, {"_id": 0})
    return FuturePlanResponse(**updated_plan)

@api_router.delete("/plans/{plan_id}")
async def delete_plan(plan_id: str, current_user: dict = Depends(get_current_user)):
    plan = await db.future_plans.find_one({"id": plan_id, "user_id": current_user["id"]}, {"_id": 0})
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    await db.future_plans.delete_one({"id": plan_id})
    await log_activity(current_user["id"], "plan_deleted", f"Deleted plan: {plan['title']}")
    return {"message": "Plan deleted successfully"}

# ==================== ACTIVITIES/HISTORY ROUTES ====================

@api_router.get("/activities", response_model=List[ActivityResponse])
async def get_activities(limit: int = 50, current_user: dict = Depends(get_current_user)):
    activities = await db.activities.find(
        {"user_id": current_user["id"]}, 
        {"_id": 0}
    ).sort("created_at", -1).to_list(limit)
    return [ActivityResponse(**a) for a in activities]

@api_router.get("/stats")
async def get_stats(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    
    total_tasks = await db.tasks.count_documents({"user_id": user_id})
    completed_tasks = await db.tasks.count_documents({"user_id": user_id, "status": "completed"})
    pending_tasks = await db.tasks.count_documents({"user_id": user_id, "status": "pending"})
    incomplete_tasks = await db.tasks.count_documents({"user_id": user_id, "status": "incomplete"})
    total_plans = await db.future_plans.count_documents({"user_id": user_id})
    
    return {
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "pending_tasks": pending_tasks,
        "incomplete_tasks": incomplete_tasks,
        "total_plans": total_plans,
        "points": current_user["points"],
        "redeemable_points": current_user.get("redeemable_points", 0),
        "rank": get_rank(current_user["points"])
    }

@api_router.get("/stats/history")
async def get_stats_history(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    
    # Get activities grouped by date
    activities = await db.activities.find(
        {"user_id": user_id},
        {"_id": 0}
    ).sort("created_at", 1).to_list(1000)
    
    # Group by date and calculate cumulative points
    daily_stats = {}
    cumulative_points = 0
    cumulative_tasks = 0
    
    for activity in activities:
        date_str = activity["created_at"][:10]  # Get YYYY-MM-DD
        points = activity.get("points_earned", 0)
        cumulative_points += points
        
        if activity["action"] == "task_completed":
            cumulative_tasks += 1
        
        daily_stats[date_str] = {
            "date": date_str,
            "points": cumulative_points,
            "tasks_completed": cumulative_tasks
        }
    
    # Convert to list and ensure we have data points
    history = list(daily_stats.values())
    
    # If no history, create initial point
    if not history:
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        history = [{"date": today, "points": 0, "tasks_completed": 0}]
    
    return {"history": history}

# ==================== AVATAR/PROFILE ROUTES ====================

@api_router.get("/avatars")
async def get_avatars(current_user: dict = Depends(get_current_user)):
    unlocked = current_user.get("unlocked_avatars", [])
    avatars_with_status = []
    for avatar in AVATARS:
        avatars_with_status.append({
            **avatar,
            "unlocked": avatar["id"] in unlocked
        })
    return {
        "avatars": avatars_with_status,
        "redeemable_points": current_user.get("redeemable_points", 0),
        "current_avatar": current_user.get("current_avatar")
    }

@api_router.post("/avatars/{avatar_id}/unlock")
async def unlock_avatar(avatar_id: str, current_user: dict = Depends(get_current_user)):
    # Find avatar
    avatar = next((a for a in AVATARS if a["id"] == avatar_id), None)
    if not avatar:
        raise HTTPException(status_code=404, detail="Avatar not found")
    
    # Check if already unlocked
    unlocked = current_user.get("unlocked_avatars", [])
    if avatar_id in unlocked:
        raise HTTPException(status_code=400, detail="Avatar already unlocked")
    
    # Check points
    redeemable = current_user.get("redeemable_points", 0)
    if redeemable < avatar["price"]:
        raise HTTPException(status_code=400, detail="Not enough redeemable points")
    
    # Unlock avatar
    await db.users.update_one(
        {"id": current_user["id"]},
        {
            "$inc": {"redeemable_points": -avatar["price"]},
            "$push": {"unlocked_avatars": avatar_id}
        }
    )
    
    await log_activity(current_user["id"], "avatar_unlocked", f"Unlocked avatar: {avatar['name']} (-{avatar['price']} pts)")
    
    return {"message": f"Avatar {avatar['name']} unlocked!", "avatar": avatar}

@api_router.post("/avatars/{avatar_id}/select")
async def select_avatar(avatar_id: str, current_user: dict = Depends(get_current_user)):
    # Check if unlocked
    unlocked = current_user.get("unlocked_avatars", [])
    if avatar_id not in unlocked:
        raise HTTPException(status_code=400, detail="Avatar not unlocked")
    
    await db.users.update_one(
        {"id": current_user["id"]},
        {"$set": {"current_avatar": avatar_id}}
    )
    
    return {"message": "Avatar selected!", "current_avatar": avatar_id}

# ==================== COURSES ROUTES ====================

@api_router.post("/courses")
async def create_course(course_data: CourseCreate, current_user: dict = Depends(get_current_user)):
    course_id = str(uuid.uuid4())
    course = {
        "id": course_id,
        "user_id": current_user["id"],
        "name": course_data.name,
        "code": course_data.code,
        "color": course_data.color,
        "description": course_data.description or "",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.courses.insert_one(course)
    await log_activity(current_user["id"], "course_created", f"Created course: {course_data.name}")
    course.pop("_id", None)
    return course

@api_router.get("/courses")
async def get_courses(current_user: dict = Depends(get_current_user)):
    courses = await db.courses.find({"user_id": current_user["id"]}, {"_id": 0}).to_list(100)
    return courses

@api_router.delete("/courses/{course_id}")
async def delete_course(course_id: str, current_user: dict = Depends(get_current_user)):
    await db.courses.delete_one({"id": course_id, "user_id": current_user["id"]})
    await db.modules.delete_many({"course_id": course_id})
    await db.assignments.delete_many({"course_id": course_id})
    return {"message": "Course deleted"}

# ==================== MODULES ROUTES ====================

@api_router.post("/modules")
async def create_module(module_data: ModuleCreate, current_user: dict = Depends(get_current_user)):
    module_id = str(uuid.uuid4())
    module = {
        "id": module_id,
        "course_id": module_data.course_id,
        "user_id": current_user["id"],
        "title": module_data.title,
        "content": module_data.content,
        "order": module_data.order,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.modules.insert_one(module)
    module.pop("_id", None)
    return module

@api_router.get("/modules/{course_id}")
async def get_modules(course_id: str, current_user: dict = Depends(get_current_user)):
    modules = await db.modules.find({"course_id": course_id}, {"_id": 0}).sort("order", 1).to_list(100)
    return modules

# ==================== ASSIGNMENTS ROUTES ====================

@api_router.post("/assignments")
async def create_assignment(data: AssignmentCreate, current_user: dict = Depends(get_current_user)):
    assignment_id = str(uuid.uuid4())
    assignment = {
        "id": assignment_id,
        "user_id": current_user["id"],
        "course_id": data.course_id,
        "module_id": data.module_id,
        "title": data.title,
        "description": data.description,
        "due_date": data.due_date,
        "due_time": data.due_time,
        "points": data.points,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.assignments.insert_one(assignment)
    await log_activity(current_user["id"], "assignment_created", f"New assignment: {data.title}")
    assignment.pop("_id", None)
    return assignment

@api_router.get("/assignments")
async def get_assignments(current_user: dict = Depends(get_current_user)):
    assignments = await db.assignments.find({"user_id": current_user["id"]}, {"_id": 0}).to_list(100)
    # Add course info
    for a in assignments:
        course = await db.courses.find_one({"id": a.get("course_id")}, {"_id": 0})
        a["course"] = course
    return assignments

@api_router.put("/assignments/{assignment_id}/complete")
async def complete_assignment(assignment_id: str, current_user: dict = Depends(get_current_user)):
    assignment = await db.assignments.find_one({"id": assignment_id, "user_id": current_user["id"]}, {"_id": 0})
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    if assignment["status"] == "completed":
        raise HTTPException(status_code=400, detail="Already completed")
    
    points = assignment.get("points", 10)
    redeemable = points // 2
    
    await db.assignments.update_one({"id": assignment_id}, {"$set": {"status": "completed"}})
    await db.users.update_one(
        {"id": current_user["id"]},
        {"$inc": {"points": points, "redeemable_points": redeemable}}
    )
    await log_activity(current_user["id"], "assignment_completed", f"Completed: {assignment['title']} (+{points} pts)", points)
    
    return {"message": "Assignment completed!", "points_earned": points, "redeemable_earned": redeemable}

# ==================== FRIENDS ROUTES ====================

@api_router.post("/friends/add")
async def add_friend(data: FriendRequest, current_user: dict = Depends(get_current_user)):
    # Validate UNPHU email
    if not data.friend_email.endswith("@unphu.edu.do"):
        raise HTTPException(status_code=400, detail="Solo se permiten correos institucionales (@unphu.edu.do)")
    
    # Find friend by email
    friend = await db.users.find_one({"email": data.friend_email}, {"_id": 0, "password": 0})
    if not friend:
        raise HTTPException(status_code=404, detail="User not found with that email")
    
    if friend["id"] == current_user["id"]:
        raise HTTPException(status_code=400, detail="Cannot add yourself")
    
    # Check if already friends
    existing = await db.friends.find_one({
        "user_id": current_user["id"],
        "friend_id": friend["id"]
    })
    if existing:
        raise HTTPException(status_code=400, detail="Already friends")
    
    # Add friendship both ways
    friendship_id = str(uuid.uuid4())
    await db.friends.insert_one({
        "id": friendship_id,
        "user_id": current_user["id"],
        "friend_id": friend["id"],
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    await db.friends.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": friend["id"],
        "friend_id": current_user["id"],
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    await log_activity(current_user["id"], "friend_added", f"Added friend: {friend['name']}")
    
    # Notify friend
    await create_notification(
        friend["id"],
        "Nueva solicitud de amistad",
        f"{current_user['name']} te agregó como amigo",
        "friend"
    )
    
    return {"message": f"Added {friend['name']} as friend!", "friend": {
        "id": friend["id"],
        "name": friend["name"],
        "email": friend["email"],
        "points": friend["points"],
        "rank": get_rank(friend["points"]),
        "current_avatar": friend.get("current_avatar")
    }}

@api_router.get("/friends")
async def get_friends(current_user: dict = Depends(get_current_user)):
    friendships = await db.friends.find({"user_id": current_user["id"]}, {"_id": 0}).to_list(100)
    friends = []
    for f in friendships:
        friend = await db.users.find_one({"id": f["friend_id"]}, {"_id": 0, "password": 0})
        if friend:
            friends.append({
                "id": friend["id"],
                "name": friend["name"],
                "email": friend["email"],
                "points": friend["points"],
                "rank": get_rank(friend["points"]),
                "current_avatar": friend.get("current_avatar")
            })
    return friends

@api_router.delete("/friends/{friend_id}")
async def remove_friend(friend_id: str, current_user: dict = Depends(get_current_user)):
    await db.friends.delete_one({"user_id": current_user["id"], "friend_id": friend_id})
    await db.friends.delete_one({"user_id": friend_id, "friend_id": current_user["id"]})
    return {"message": "Friend removed"}

# ==================== STORE/PURCHASE ROUTES ====================

@api_router.get("/store/packages")
async def get_packages():
    return {"packages": POINT_PACKAGES}

@api_router.post("/store/purchase")
async def purchase_points(data: PurchasePoints, current_user: dict = Depends(get_current_user)):
    # Find package
    package = next((p for p in POINT_PACKAGES if p["id"] == data.package_id), None)
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")
    
    # In production, here you would integrate with actual payment gateway
    # For now, we simulate a successful purchase
    
    # Record purchase
    purchase_id = str(uuid.uuid4())
    await db.purchases.insert_one({
        "id": purchase_id,
        "user_id": current_user["id"],
        "package_id": data.package_id,
        "points": package["points"],
        "payment_method": data.payment_method,
        "amount_dop": package["price_dop"],
        "status": "completed",
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    # Add points to user
    await db.users.update_one(
        {"id": current_user["id"]},
        {"$inc": {"redeemable_points": package["points"]}}
    )
    
    await log_activity(current_user["id"], "points_purchased", f"Purchased {package['points']} points")
    
    return {
        "message": f"Successfully purchased {package['points']} points!",
        "points_added": package["points"]
    }

# ==================== CALENDAR ROUTES ====================

@api_router.get("/calendar/events")
async def get_calendar_events(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    
    # Get tasks
    tasks = await db.tasks.find({"user_id": user_id}, {"_id": 0}).to_list(100)
    
    # Get assignments
    assignments = await db.assignments.find({"user_id": user_id}, {"_id": 0}).to_list(100)
    
    events = []
    
    for task in tasks:
        events.append({
            "id": task["id"],
            "type": "task",
            "title": task["title"],
            "date": task["due_date"],
            "time": task.get("due_time", "12:00"),
            "status": task["status"],
            "color": "#10B981"
        })
    
    for assignment in assignments:
        course = await db.courses.find_one({"id": assignment.get("course_id")}, {"_id": 0})
        events.append({
            "id": assignment["id"],
            "type": "assignment",
            "title": assignment["title"],
            "date": assignment["due_date"],
            "time": assignment.get("due_time", "23:59"),
            "status": assignment["status"],
            "course": course.get("name") if course else "Sin curso",
            "color": course.get("color", "#8B5CF6") if course else "#8B5CF6"
        })
    
    return events

# ==================== NOTIFICATIONS ROUTES ====================

@api_router.get("/notifications")
async def get_notifications(current_user: dict = Depends(get_current_user)):
    notifications = await db.notifications.find(
        {"user_id": current_user["id"]}, {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    return notifications

@api_router.put("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, current_user: dict = Depends(get_current_user)):
    await db.notifications.update_one(
        {"id": notification_id, "user_id": current_user["id"]},
        {"$set": {"read": True}}
    )
    return {"message": "Notification marked as read"}

@api_router.put("/notifications/read-all")
async def mark_all_notifications_read(current_user: dict = Depends(get_current_user)):
    await db.notifications.update_many(
        {"user_id": current_user["id"], "read": False},
        {"$set": {"read": True}}
    )
    return {"message": "All notifications marked as read"}

async def create_notification(user_id: str, title: str, message: str, ntype: str = "info"):
    notification = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "title": title,
        "message": message,
        "type": ntype,
        "read": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.notifications.insert_one(notification)

# ==================== CHAT/MESSAGES ROUTES ====================

@api_router.post("/messages")
async def send_message(data: MessageCreate, current_user: dict = Depends(get_current_user)):
    # Verify friendship
    friendship = await db.friends.find_one({
        "user_id": current_user["id"],
        "friend_id": data.to_user_id
    })
    if not friendship:
        raise HTTPException(status_code=400, detail="You can only message friends")
    
    message_id = str(uuid.uuid4())
    # Create a consistent chat_id for both users
    ids = sorted([current_user["id"], data.to_user_id])
    chat_id = f"{ids[0]}_{ids[1]}"
    
    message = {
        "id": message_id,
        "chat_id": chat_id,
        "from_user_id": current_user["id"],
        "to_user_id": data.to_user_id,
        "content": data.content,
        "read": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.messages.insert_one(message)
    
    # Notify recipient
    await create_notification(
        data.to_user_id,
        "Nuevo mensaje",
        f"{current_user['name']} te envió un mensaje",
        "message"
    )
    
    message.pop("_id", None)
    return message

@api_router.get("/messages/{friend_id}")
async def get_messages(friend_id: str, current_user: dict = Depends(get_current_user)):
    ids = sorted([current_user["id"], friend_id])
    chat_id = f"{ids[0]}_{ids[1]}"
    
    messages = await db.messages.find(
        {"chat_id": chat_id}, {"_id": 0}
    ).sort("created_at", 1).to_list(200)
    
    # Mark messages as read
    await db.messages.update_many(
        {"chat_id": chat_id, "to_user_id": current_user["id"], "read": False},
        {"$set": {"read": True}}
    )
    
    return messages

@api_router.get("/messages/unread/count")
async def get_unread_count(current_user: dict = Depends(get_current_user)):
    count = await db.messages.count_documents({
        "to_user_id": current_user["id"],
        "read": False
    })
    return {"unread_count": count}

# ==================== STUDY GROUPS ROUTES ====================

@api_router.post("/groups")
async def create_group(data: GroupCreate, current_user: dict = Depends(get_current_user)):
    group_id = str(uuid.uuid4())
    group = {
        "id": group_id,
        "name": data.name,
        "description": data.description or "",
        "creator_id": current_user["id"],
        "members": [{"user_id": current_user["id"], "name": current_user["name"], "role": "admin"}],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.groups.insert_one(group)
    await log_activity(current_user["id"], "group_created", f"Created study group: {data.name}")
    group.pop("_id", None)
    return group

@api_router.get("/groups")
async def get_groups(current_user: dict = Depends(get_current_user)):
    groups = await db.groups.find(
        {"members.user_id": current_user["id"]}, {"_id": 0}
    ).to_list(50)
    # Add task count for each group
    for g in groups:
        g["task_count"] = await db.group_tasks.count_documents({"group_id": g["id"]})
        g["completed_count"] = await db.group_tasks.count_documents({"group_id": g["id"], "status": "completed"})
    return groups

@api_router.post("/groups/{group_id}/members")
async def add_group_member(group_id: str, data: FriendRequest, current_user: dict = Depends(get_current_user)):
    group = await db.groups.find_one({"id": group_id}, {"_id": 0})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    # Find user by email
    user = await db.users.find_one({"email": data.friend_email}, {"_id": 0, "password": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if already member
    if any(m["user_id"] == user["id"] for m in group["members"]):
        raise HTTPException(status_code=400, detail="Already a member")
    
    await db.groups.update_one(
        {"id": group_id},
        {"$push": {"members": {"user_id": user["id"], "name": user["name"], "role": "member"}}}
    )
    
    await create_notification(
        user["id"],
        "Grupo de estudio",
        f"{current_user['name']} te agregó al grupo '{group['name']}'",
        "group"
    )
    
    return {"message": f"{user['name']} added to group"}

@api_router.delete("/groups/{group_id}")
async def delete_group(group_id: str, current_user: dict = Depends(get_current_user)):
    group = await db.groups.find_one({"id": group_id}, {"_id": 0})
    if not group or group["creator_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Only the creator can delete this group")
    await db.groups.delete_one({"id": group_id})
    await db.group_tasks.delete_many({"group_id": group_id})
    return {"message": "Group deleted"}

@api_router.post("/groups/tasks")
async def create_group_task(data: GroupTaskCreate, current_user: dict = Depends(get_current_user)):
    group = await db.groups.find_one({"id": data.group_id, "members.user_id": current_user["id"]}, {"_id": 0})
    if not group:
        raise HTTPException(status_code=403, detail="Not a member of this group")
    
    task_id = str(uuid.uuid4())
    task = {
        "id": task_id,
        "group_id": data.group_id,
        "title": data.title,
        "description": data.description or "",
        "due_date": data.due_date,
        "status": "pending",
        "created_by": current_user["id"],
        "created_by_name": current_user["name"],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.group_tasks.insert_one(task)
    task.pop("_id", None)
    
    # Notify group members
    for member in group["members"]:
        if member["user_id"] != current_user["id"]:
            await create_notification(
                member["user_id"],
                "Nueva tarea grupal",
                f"{current_user['name']} creó la tarea '{data.title}' en {group['name']}",
                "group_task"
            )
    
    return task

@api_router.get("/groups/{group_id}/tasks")
async def get_group_tasks(group_id: str, current_user: dict = Depends(get_current_user)):
    tasks = await db.group_tasks.find({"group_id": group_id}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return tasks

@api_router.put("/groups/tasks/{task_id}/complete")
async def complete_group_task(task_id: str, current_user: dict = Depends(get_current_user)):
    task = await db.group_tasks.find_one({"id": task_id}, {"_id": 0})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if task["status"] == "completed":
        raise HTTPException(status_code=400, detail="Already completed")
    
    await db.group_tasks.update_one({"id": task_id}, {"$set": {"status": "completed", "completed_by": current_user["id"]}})
    
    # Award points
    await db.users.update_one(
        {"id": current_user["id"]},
        {"$inc": {"points": 5, "redeemable_points": 3}}
    )
    await log_activity(current_user["id"], "group_task_completed", f"Completed group task: {task['title']} (+5 pts)", 5)
    
    return {"message": "Task completed!", "points_earned": 5}

# ==================== CHALLENGES ROUTES ====================

# Predefined challenges
CHALLENGES = [
    {"id": "weekly_5_tasks", "name": "Cinco al Día", "description": "Completa 5 tareas esta semana", "type": "weekly", "target": 5, "action": "task_completed", "reward_points": 50, "reward_redeemable": 25},
    {"id": "weekly_3_assignments", "name": "Estudiante Dedicado", "description": "Completa 3 asignaciones esta semana", "type": "weekly", "target": 3, "action": "assignment_completed", "reward_points": 75, "reward_redeemable": 35},
    {"id": "weekly_create_course", "name": "Organizador", "description": "Crea un curso y 2 módulos esta semana", "type": "weekly", "target": 2, "action": "module_created", "reward_points": 30, "reward_redeemable": 15},
    {"id": "monthly_20_tasks", "name": "Máquina de Productividad", "description": "Completa 20 tareas este mes", "type": "monthly", "target": 20, "action": "task_completed", "reward_points": 200, "reward_redeemable": 100},
    {"id": "monthly_10_assignments", "name": "Académico Imparable", "description": "Completa 10 asignaciones este mes", "type": "monthly", "target": 10, "action": "assignment_completed", "reward_points": 300, "reward_redeemable": 150},
    {"id": "monthly_add_friends", "name": "Social Butterfly", "description": "Agrega 3 amigos este mes", "type": "monthly", "target": 3, "action": "friend_added", "reward_points": 100, "reward_redeemable": 50},
]

@api_router.get("/challenges")
async def get_challenges(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    now = datetime.now(timezone.utc)
    
    # Calculate period start dates
    week_start = (now - timedelta(days=now.weekday())).replace(hour=0, minute=0, second=0, microsecond=0)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    challenges_with_progress = []
    
    for challenge in CHALLENGES:
        period_start = week_start if challenge["type"] == "weekly" else month_start
        
        # Count user's progress
        progress = await db.activities.count_documents({
            "user_id": user_id,
            "action": challenge["action"],
            "created_at": {"$gte": period_start.isoformat()}
        })
        
        # Check if already claimed
        claimed = await db.challenge_claims.find_one({
            "user_id": user_id,
            "challenge_id": challenge["id"],
            "period_start": period_start.isoformat()
        })
        
        challenges_with_progress.append({
            **challenge,
            "progress": min(progress, challenge["target"]),
            "completed": progress >= challenge["target"],
            "claimed": claimed is not None
        })
    
    return challenges_with_progress

@api_router.post("/challenges/{challenge_id}/claim")
async def claim_challenge(challenge_id: str, current_user: dict = Depends(get_current_user)):
    challenge = next((c for c in CHALLENGES if c["id"] == challenge_id), None)
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")
    
    now = datetime.now(timezone.utc)
    week_start = (now - timedelta(days=now.weekday())).replace(hour=0, minute=0, second=0, microsecond=0)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    period_start = week_start if challenge["type"] == "weekly" else month_start
    
    # Check if already claimed
    claimed = await db.challenge_claims.find_one({
        "user_id": current_user["id"],
        "challenge_id": challenge_id,
        "period_start": period_start.isoformat()
    })
    if claimed:
        raise HTTPException(status_code=400, detail="Already claimed")
    
    # Verify progress
    progress = await db.activities.count_documents({
        "user_id": current_user["id"],
        "action": challenge["action"],
        "created_at": {"$gte": period_start.isoformat()}
    })
    
    if progress < challenge["target"]:
        raise HTTPException(status_code=400, detail="Challenge not completed yet")
    
    # Award points
    await db.users.update_one(
        {"id": current_user["id"]},
        {"$inc": {"points": challenge["reward_points"], "redeemable_points": challenge["reward_redeemable"]}}
    )
    
    # Record claim
    await db.challenge_claims.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": current_user["id"],
        "challenge_id": challenge_id,
        "period_start": period_start.isoformat(),
        "claimed_at": now.isoformat()
    })
    
    await log_activity(
        current_user["id"], "challenge_claimed",
        f"Claimed challenge: {challenge['name']} (+{challenge['reward_points']} pts)",
        challenge["reward_points"]
    )
    
    return {
        "message": f"¡Desafío '{challenge['name']}' completado!",
        "points_earned": challenge["reward_points"],
        "redeemable_earned": challenge["reward_redeemable"]
    }

# ==================== HEALTH CHECK ====================

@api_router.get("/")
async def root():
    return {"message": "TaskFlow Lite API", "status": "running"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()


if __name__ == "__main__":
    import uvicorn
    # Render asigna un puerto dinámico en la variable de entorno PORT
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("server:app", host="0.0.0.0", port=port, reload=False)
