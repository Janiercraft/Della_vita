necesito que me crees un proyecto java springboot con las siguientes especificaciones.

usaremos: 
opejdk-25
lenguaje leel 25-compact source files, module import, etc.
docker
hibernate
Lombook
jpa
maven
base de datos postgres

asi será la estructuta de las carpetas

src/main/java/com/proyecto/
├── controller/│   
├── CategoryController.java│   
├── ProductController.java│   
└── ReviewController.java

├── dto/│   
├── CategoryDTO.java│   
├── ProductDTO.java│   
└── ReviewDTO.java

├── model/│   
├── Category.java│   
├── Product.java│   
└── Review.java

├── repository/│   
├── CategoryRepository.java│   
├── ProductRepository.java│   
└── ReviewRepository.java

└── service/    
├── CategoryService.java    
├── ProductService.java    
├── ReviewService.java    
└── impl/        
├── CategoryServiceImpl.java        
├── ProductServiceImpl.java        
└── ReviewServiceImpl.java

Asi seran los nombres de las variables y clases en los archivos: 
dto,model,service,impl,comtrollers,repositori 

ejemplo:

variables: primerNombre,celular,primerApellido.
clases: guardarPersona, modificarEstado,listaPersonas
consultas de repository: buscarNombrePersona, consultarEstado o con jpa findbyEstado, findBynombre etc.

asi de organizadas quiero que esten mis logicas. Ojo esta clase que te voy a pasar es solo un ejemplo de 
lo que quiero que hagas.


import com.bancopopular.credicore.mscatalogos.dto.DaneDepartamentosDto;
import com.bancopopular.credicore.mscatalogos.exception.ExcepcionCatalogo;
import com.bancopopular.credicore.mscatalogos.model.DaneDepartamentos;
import com.bancopopular.credicore.mscatalogos.repository.DaneDepartamentosRepository;
import com.bancopopular.credicore.mscatalogos.service.DaneDepartamentosService;
import com.bancopopular.credicore.mscatalogos.util.GeneralCTE;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Slf4j
public class DaneDepartamentosServiceImpl implements DaneDepartamentosService {

    @Autowired
    private DaneDepartamentosRepository departamentosRepository;

    @Override
    public Mono<DaneDepartamentosDto> guardar(DaneDepartamentosDto dto) {

        Optional<DaneDepartamentos> idDepartamento = departamentosRepository.findById(dto.getIdDepartamento());
        if (idDepartamento.isPresent()) {
            throw new ExcepcionCatalogo(GeneralCTE.COD0022, HttpStatus.BAD_REQUEST,GeneralCTE.CODIGODESCRIPCION_YA_EXISTE_ID);
        }

        DaneDepartamentos nombreDepartamento = departamentosRepository.findByNombreDepartamento(dto.getNombreDepartamento());
        if (nombreDepartamento != null) {
            throw new ExcepcionCatalogo(GeneralCTE.COD0044, HttpStatus.BAD_REQUEST,GeneralCTE.NOMBRE_YA_EXISTE_DEPARTAMENTO);
        }
        DaneDepartamentos departamentos = new DaneDepartamentos();
        departamentos.setIdDepartamento(dto.getIdDepartamento());
        departamentos.setNombreDepartamento(dto.getNombreDepartamento());
        departamentos.setAbreviaturaDepartamento(dto.getAbreviaturaDepartamento());
        departamentos.setActivo(GeneralCTE.ACTIVO_DEPARTAMENTO);
        departamentos.setDtCreacion(new Date());
        departamentos.setDtActualizacion(null);
        departamentos.setUsuarioActualizacion(null);
        departamentos.setUsuarioCreacion(dto.getUsuarioCreacion());
        departamentosRepository.save(departamentos);

        return Mono.just(dto);
    }


    @Override
    public Mono<DaneDepartamentosDto> editar(DaneDepartamentosDto dto) {

        Optional<DaneDepartamentos> consultarDepartamento = departamentosRepository.findById(dto.getIdDepartamento());

        if (!consultarDepartamento.isPresent()) {
            throw new ExcepcionCatalogo(GeneralCTE.COD0033, HttpStatus.BAD_REQUEST,GeneralCTE.CODIGO_NO_EXISTE_DEPARTAMENTO);
        }

        if (!consultarDepartamento.get().getIdDepartamento().equals(dto.getIdDepartamento())) {
            throw new ExcepcionCatalogo(GeneralCTE.COD0022, HttpStatus.BAD_REQUEST,GeneralCTE.CODIGODESCRIPCION_YA_EXISTE_ID);
        }

        DaneDepartamentos nombreDepartamento = departamentosRepository.findByNombreDepartamento(dto.getNombreDepartamento());
        if(nombreDepartamento != null && !nombreDepartamento.getNombreDepartamento().equals(dto.getNombreDepartamento())){
            throw new ExcepcionCatalogo(GeneralCTE.COD0044, HttpStatus.BAD_REQUEST,GeneralCTE.NOMBRE_YA_EXISTE_DEPARTAMENTO);
        }

        DaneDepartamentos editarDepartamento = consultarDepartamento.get();
        editarDepartamento.setIdDepartamento(dto.getIdDepartamento());
        editarDepartamento.setNombreDepartamento(dto.getNombreDepartamento());
        editarDepartamento.setAbreviaturaDepartamento(dto.getAbreviaturaDepartamento());
        editarDepartamento.setUsuarioActualizacion(dto.getUsuarioActualizacion());
        editarDepartamento.setDtActualizacion(new Date());
        departamentosRepository.save(editarDepartamento);

        return Mono.just(dto);
    }

    @Override
    public Mono<DaneDepartamentosDto> cambiarEstado(DaneDepartamentosDto dto) {

        Optional<DaneDepartamentos> departamentos = departamentosRepository.findById(dto.getIdDepartamento());
        if (!departamentos.isPresent()) {
            throw new ExcepcionCatalogo(GeneralCTE.COD007, HttpStatus.BAD_REQUEST, GeneralCTE.ERROR_CODIGO);
        }

        departamentosRepository.cambiarEstado(Boolean.TRUE.equals(dto.getActivo()) ? GeneralCTE.ACTIVO_DEPARTAMENTO : GeneralCTE.INACTIVO_DEPARTAMENTO, dto.getIdDepartamento());

        return Mono.just(dto);

    }



    @Override
    public Mono<List<DaneDepartamentosDto>> listar(DaneDepartamentosDto request) {

        List<DaneDepartamentos> departamentosList = departamentosRepository.findAll();

        List<DaneDepartamentosDto> listadepartamentos = departamentosList.stream()
                .map(departamentos -> DaneDepartamentosDto.builder()
                        .idDepartamento(departamentos.getIdDepartamento())
                        .nombreDepartamento(departamentos.getNombreDepartamento())
                        .abreviaturaDepartamento(departamentos.getAbreviaturaDepartamento())
                        .dtCreacion(departamentos.getDtCreacion())

                        .dtActualizacion(departamentos.getDtActualizacion())
                        .activo(departamentos.getActivo().equals(GeneralCTE.ACTIVO_DEPARTAMENTO) ? Boolean.TRUE : Boolean.FALSE)
                        .build()).collect(Collectors.toList());

        return Mono.just(listadepartamentos);
    } 


no quieros que hagas cosas extremadamente dificiles de entender como esto 

@Transactional
    @Override
    public DeliveryResponse crear(DeliveryRequest r) {
        var a=assignmentRepository.findById(r.getAssignmentId()).orElseThrow(()->new NotFoundException("Asignación no encontrada"));
        var v=userRepository.findById(r.getVolunteerId()).orElseThrow(()->new NotFoundException("Voluntario no encontrado"));
        if(v.getRole()!=Role.VOLUNTEER)throw new ConflictException("El usuario no es VOLUNTEER");
        if(deliveryRepository.existsByAssignmentIdAndStatus(a.getId(),DeliveryStatus.COMPLETED))throw new ConflictException("La asignación ya tiene una entrega completada");
        var d=new Delivery();
        d.setAssignment(a);
        d.setVolunteer(v);
        d.setDeliveryDate(r.getDeliveryDate()==null?Instant.now():r.getDeliveryDate());
        d.setObservations(r.getObservations());
        d.setStatus(DeliveryStatus.SCHEDULED);
        return convertirARespuesta(deliveryRepository.save(d));
    }

este tipo de codigos solo lo puedes hacer cuando el problema es muy complejo.


asi de organizados quiero que sean mis dto

@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DaneDepartamentosDto {

    private Integer idDepartamento;

    private String nombreDepartamento;

    private String abreviaturaDepartamento;

    private Boolean activo;

    private Date dtCreacion;

    private Date dtActualizacion;

    private  String usuarioCreacion;

    private  String usuarioActualizacion;
}


asi de organizados quiero que sean mis model


@Data
@Entity
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(schema = "OT_CATALOGOS",name = "DANE_CIUDADES")
public class DaneCiudades {

    @Column(name = "ID_CIUDAD")
    private String IdCiudad;

    @Column(name = "NOMBRE_CIUDAD")
    private String NombreCiudad;

    @Column(name = "ID_DEPARTAMENTO")
    private Integer IdDepartamento;

    @Column(name = "ACTIVO")
    private Integer Activo;

    @Column(name = "DT_CREACION")
    private Date DtCreacion;

    @Column(name = "DT_ACTUALIZACION")
    private Date DtActualizacion;

    @Column(name = "USUARIO_CREACION")
    private String usuarioCreacion;

    @Column(name = "USUARIO_ACTUALIZACION")
    private String usuarioActualizacion;

}

asi de organizados quiero que sean mis  ropository


@Repository
public interface DaneDepartamentosRepository extends JpaRepository<DaneDepartamentos, Integer> {




    Optional<DaneDepartamentos> obtenerNombreDepartamento(String nombreDepartamento);
    /*
     Esta consulta enlista departamentos con estado activos
    */
    @Query("Select cd from CatalogoDepartamentos cd WHERE cd.activo =:activo")
    List<DaneDepartamentos> listarsActivo(@Param("activo") Integer activo);

    //@Query("select cd from CatalogoDepartamentos cd WHERE cd.nombreDepartamento =:nombreDepartamento")
    DaneDepartamentos findByNombreDepartamento(@Param("nombreDepartamento") String nombreDepartamento);

     /*
     Esta consulta modifica el estado
     */
    @Modifying
    @Transactional
    @Query(value = "UPDATE CatalogoDepartamentos e SET e.activo =:activo where e.idDepartamento =:idDepartamento ")
    int cambiarEstado(@Param("activo") Integer activo, @Param("idDepartamento") int idDepartamento);



asi de organizados quiero que sean mis controller

@RestController
@Api(tags = "Dane Departamentos Controller")
@RequestMapping("${application.api.path}")
@CrossOrigin(origins = "*")
@Slf4j

@Autowired
    DaneDepartamentosService catalogoDepartamentosService;

    @ApiOperation(value = "Guarda el registro del departamento", response = DaneDepartamentosDto.class, httpMethod = "POST")
    @ApiResponses({@ApiResponse(code = 200, message = "Operacion exitosa, guarda el registro del departamento")})
    @PostMapping(value = "/dane/departamentos/guardar")
    public Mono<DaneDepartamentosDto> guardar(DaneDepartamentosDto dto) {
        return catalogoDepartamentosService.guardar(dto);
    }

    @ApiOperation(value = "Muestra una lista con el departamento", response = DaneDepartamentosDto.class, httpMethod = "POST")
    @ApiResponses({@ApiResponse(code = 200, message = "Operacion exitosa, muestra a lista del departamento")})
    @PostMapping(value = "/dane/departamentos/listar")
    public Mono<List<DaneDepartamentosDto>> listar(DaneDepartamentosDto request) {
        return catalogoDepartamentosService.listar(request);
    }

    @ApiOperation(value = "Cambia el estado del departamento", response = DaneDepartamentosDto.class, httpMethod = "POST")
    @ApiResponses({ @ApiResponse(code = 200, message = "Operacion exitosa, se Cambia el estado del departamento") })
    @PostMapping(value = "/dane/departamentos/cambiarEstado")
    public Mono<DaneDepartamentosDto> cambiarEstado(@RequestBody DaneDepartamentosDto request) {
        return catalogoDepartamentosService.cambiarEstado(request);
    }

    @ApiOperation(value = "Cambian datos del departamento", response = DaneDepartamentosDto.class, httpMethod = "POST")
    @ApiResponses({ @ApiResponse(code = 200, message = "Operacion exitosa, se Cambia los datos del departamento") })
    @PostMapping(value = "/dane/departamentos/editar")
    public Mono<DaneDepartamentosDto> editar(@RequestBody DaneDepartamentosDto request) {
        return catalogoDepartamentosService.editar(request);
    }
asi de organizados quiero que sean mis services

public interface DaneDepartamentosService {

    Mono<DaneDepartamentosDto> guardar(DaneDepartamentosDto dto);

    Mono<DaneDepartamentosDto> editar(DaneDepartamentosDto dto);

    Mono<DaneDepartamentosDto> cambiarEstado(DaneDepartamentosDto dto);

    Mono<List<DaneDepartamentosDto>> listar(DaneDepartamentosDto request);


- quiero que mis logicas tengan una trazabilidad con souprints para saber dosde falla el codigo.
- quiero que cada vez que se haga una accion muestre sus mensajes como, se guardo corrertamente, faltó "x" parametro, que los errores sean controlados siempre.
- las consultas jpa van solo en el repository
- usa los principios solid para tener un proyecto organizado
- quiero que mi estructura le pueda dar solucion a cualquier situacion

EN ESTA PARTE ESTA LA SITUACION QUE DEBES RESOLVER:
{

necesito una solucion a una biblioteca, donde registraré la salida y entrada de los estudiantes que presten los libros

}

SEGUN EL PROBLEMA TU ME DIRAS SI MI ESTRUCTURA ES SUFICIENTE O SI LE DEBO AGREGAR ALGO MAS. CUANTOS IMCROSERVICIOS NECESITA ESTO, QUE ENDPOINTS NECESITA O QUE DEPENDENCIAS DEBO IMPORTAR EN MI POM.XML,COMPOSE O EL PROPERTIES.YMEL


