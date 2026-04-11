import 'dart:async';
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:feather_icons/feather_icons.dart';
import 'particle_sphere.dart';
import '../feedback/feedback_report_screen.dart';

const List<String> _questions = [
  "Tell me about yourself and your professional background.",
  "Describe a challenging project you worked on and how you handled it.",
  "What are your greatest strengths and how do they apply to this role?",
  "Where do you see yourself in five years?",
  "Tell me about a time you had to work under pressure.",
];

enum Phase { ready, speaking, listening, processing }

class InterviewSessionScreen extends StatefulWidget {
  final String interviewId;
  const InterviewSessionScreen({super.key, this.interviewId = "mock-id"});

  @override
  State<InterviewSessionScreen> createState() => _InterviewSessionScreenState();
}

class _InterviewSessionScreenState extends State<InterviewSessionScreen> with TickerProviderStateMixin {
  Phase phase = Phase.ready;
  int currentQ = 0;
  
  // Animation state
  late AnimationController _animationController;
  final List<Particle> _particles = [];
  Offset _rotation = const Offset(0, 0);
  Offset? _lastDragPosition;
  double _time = 0;

  @override
  void initState() {
    super.initState();
    _initParticles();
    _animationController = AnimationController(vsync: this, duration: const Duration(days: 1))
      ..addListener(() {
        if (!mounted) return;
        setState(() {
          _time += 0.016;
          _updateParticles();
          if (_lastDragPosition == null) {
            _rotation = Offset(_rotation.dx, _rotation.dy + 0.002);
          }
        });
      });
    _animationController.repeat();
    
    // Auto-start first question after entering
    Future.delayed(const Duration(milliseconds: 1000), () {
      if (mounted) _startAiSpeaking();
    });
  }

  void _initParticles() {
    const int numParticles = 450;
    const double radius = 90;
    final random = math.Random();
    for (int i = 0; i < numParticles; i++) {
      final phi = math.acos(1 - 2 * (i + 0.5) / numParticles);
      final theta = math.pi * (1 + math.sqrt(5)) * i;
      final x = radius * math.sin(phi) * math.cos(theta);
      final y = radius * math.sin(phi) * math.sin(theta);
      final z = radius * math.cos(phi);
      _particles.add(
        Particle(
          x: x, y: y, z: z, targetX: x, targetY: y, targetZ: z,
          baseSize: random.nextDouble() * 1.2 + 0.8,
          pulseOffset: random.nextDouble() * math.pi * 2,
          pulseSpeed: 0.8 + random.nextDouble() * 0.4,
        ),
      );
    }
  }

  void _updateParticles() {
    const springForce = 0.02;
    const damping = 0.85;
    for (var p in _particles) {
      final dx = p.targetX - p.x;
      final dy = p.targetY - p.y;
      final dz = p.targetZ - p.z;
      p.velocityX += dx * springForce;
      p.velocityY += dy * springForce;
      p.velocityZ += dz * springForce;
      p.velocityX *= damping;
      p.velocityY *= damping;
      p.velocityZ *= damping;
      p.x += p.velocityX;
      p.y += p.velocityY;
      p.z += p.velocityZ;
    }
  }

  RotatedParticle _rotateParticle(Particle p) {
    final cosX = math.cos(_rotation.dx);
    final sinX = math.sin(_rotation.dx);
    final cosY = math.cos(_rotation.dy);
    final sinY = math.sin(_rotation.dy);
    final y1 = p.y * cosX - p.z * sinX;
    final z1 = p.y * sinX + p.z * cosX;
    final x1 = p.x * cosY + z1 * sinY;
    final z2 = -p.x * sinY + z1 * cosY;
    return RotatedParticle(rx: x1, ry: y1, rz: z2, particle: p);
  }

  void _scatterParticles(Offset position, Size size) {
    final centerX = size.width / 2;
    final centerY = size.height / 2;
    const scatterRadius = 100.0;
    for (var p in _particles) {
      final rotated = _rotateParticle(p);
      final scale = 300 / (300 + rotated.rz);
      final x2d = centerX + rotated.rx * scale;
      final y2d = centerY + rotated.ry * scale;
      final dx = x2d - position.dx;
      final dy = y2d - position.dy;
      final dist = math.sqrt(dx * dx + dy * dy);
      if (dist < scatterRadius) {
        final force = (scatterRadius - dist) / scatterRadius;
        final angle = math.atan2(dy, dx);
        final scatterDist = 60 * force;
        p.x += math.cos(angle) * scatterDist;
        p.y += math.sin(angle) * scatterDist;
        p.z += (math.Random().nextDouble() - 0.5) * scatterDist;
      }
    }
  }

  void _startAiSpeaking() {
    if (!mounted) return;
    setState(() => phase = Phase.speaking);
    Future.delayed(const Duration(seconds: 4), () {
      if (mounted && phase == Phase.speaking) {
        setState(() => phase = Phase.ready);
      }
    });
  }

  void _toggleMic() {
    if (phase == Phase.ready || phase == Phase.speaking) {
      setState(() => phase = Phase.listening);
    } else if (phase == Phase.listening) {
      // User done answering
      setState(() => phase = Phase.processing);
      Future.delayed(const Duration(seconds: 3), () {
        if (!mounted) return;
        if (currentQ + 1 >= _questions.length) {
          _endInterview();
        } else {
          setState(() {
            currentQ++;
            _startAiSpeaking();
          });
        }
      });
    }
  }

  void _endInterview() {
    Navigator.pushReplacement(
      context, 
      MaterialPageRoute(builder: (context) => const FeedbackReportScreen())
    );
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    final topPadding = MediaQuery.of(context).padding.top;
    
    // Always render this screen in a dark mode aesthetic regardless of app theme, just like the legacy code.
    final darkBg = const Color(0xFF0D1117); 
    final textColor = Colors.white;
    final textSecondary = Colors.white70;

    bool isAiSpeaking = (phase == Phase.speaking);
    bool isListening = (phase == Phase.listening);
    
    Color auraColor = Colors.transparent;
    if (isAiSpeaking) {
      auraColor = const Color(0xFF007AFF).withOpacity(0.6); // Deep azure
    } else if (isListening) {
      auraColor = const Color(0xFFFF9500).withOpacity(0.6); // Amber/Warning
    } else if (phase == Phase.processing) {
      auraColor = const Color(0xFF34C759).withOpacity(0.4); // Green/Success
    }

    String topText = _questions[currentQ];
    if (phase == Phase.processing) topText = "Qlue is thinking...";
    
    String statusText = "";
    if (phase == Phase.listening) statusText = "Listening...";
    if (phase == Phase.processing) statusText = "Analyzing your response...";
    if (phase == Phase.ready) statusText = "Ready for your answer.";

    return Scaffold(
      backgroundColor: darkBg,
      body: Column(
        children: [
          // AppBar Area
          Padding(
            padding: EdgeInsets.only(top: topPadding + 10, left: 10, right: 10),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const SizedBox(width: 48), // Balancing spacer
                if (phase != Phase.processing)
                   Container(
                     padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                     decoration: BoxDecoration(
                       color: Colors.white.withOpacity(0.1),
                       borderRadius: BorderRadius.circular(12),
                     ),
                     child: Text(
                       "Q${currentQ + 1} / ${_questions.length}",
                       style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: textSecondary),
                     ),
                   ),
                TextButton(
                  onPressed: _endInterview,
                  child: Text(
                    "END",
                    style: TextStyle(
                      fontSize: 14,
                      color: const Color(0xFFFF453A),
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
          ),
          
          // TOP: AI question text
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 20.0),
            child: Text(
              topText,
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w700,
                color: textColor,
                height: 1.4,
                letterSpacing: -0.4,
              ),
              textAlign: TextAlign.center,
            ),
          ),
          
          // MIDDLE: Particle sphere
          Expanded(
            child: Stack(
              alignment: Alignment.center,
              children: [
                AnimatedContainer(
                  duration: const Duration(milliseconds: 600),
                  curve: Curves.easeInOut,
                  width: 200,
                  height: 200,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: auraColor,
                        blurRadius: 120,
                        spreadRadius: 30,
                      ),
                    ],
                  ),
                ),
                GestureDetector(
                  onPanStart: (details) {
                    _lastDragPosition = details.localPosition;
                    _scatterParticles(details.localPosition, size);
                  },
                  onPanUpdate: (details) {
                    _scatterParticles(details.localPosition, size);
                    if (_lastDragPosition != null) {
                      final delta = details.localPosition - _lastDragPosition!;
                      setState(() {
                        _rotation = Offset(
                          _rotation.dx + delta.dy * 0.005,
                          _rotation.dy + delta.dx * 0.005,
                        );
                      });
                    }
                    _lastDragPosition = details.localPosition;
                  },
                  onPanEnd: (_) => _lastDragPosition = null,
                  behavior: HitTestBehavior.translucent,
                  child: CustomPaint(
                    size: Size.infinite,
                    painter: ParticleSpherePainter(
                      particles: _particles,
                      rotation: _rotation,
                      isSpeaking: (isAiSpeaking || isListening),
                      time: _time,
                    ),
                  ),
                ),
              ],
            ),
          ),
          
          // BOTTOM: User Transcription and Interactions
          Container(
            padding: EdgeInsets.only(bottom: MediaQuery.of(context).padding.bottom + 20, left: 20, right: 20, top: 20),
            width: double.infinity,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  statusText,
                  style: TextStyle(
                    fontSize: 14,
                    color: phase == Phase.listening ? const Color(0xFFFF9500) : textSecondary,
                    fontWeight: phase == Phase.listening ? FontWeight.bold : FontWeight.normal,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 30),
                GestureDetector(
                  onTap: phase == Phase.processing ? null : _toggleMic,
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 300),
                    width: 72,
                    height: 72,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: LinearGradient(
                        colors: phase == Phase.listening
                            ? [const Color(0xFFFF453A), const Color(0xFFC92A2A)]
                            : [const Color(0xFF007AFF), const Color(0xFF0056B3)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: (phase == Phase.listening ? const Color(0xFFFF453A) : const Color(0xFF007AFF)).withOpacity(0.4),
                          offset: const Offset(0, 8),
                          blurRadius: 20,
                        ),
                      ],
                    ),
                    child: Center(
                      child: Icon(
                        phase == Phase.listening ? FeatherIcons.square : FeatherIcons.mic,
                        size: 28,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
